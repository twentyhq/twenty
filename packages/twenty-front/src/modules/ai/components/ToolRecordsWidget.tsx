import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { type ToolRecordReference } from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

const MAX_VISIBLE_RECORDS = 12;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledHeader = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledOverflow = styled.span`
  align-self: center;
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ToolRecordsWidgetProps = {
  message: string;
  recordReferences: ToolRecordReference[];
};

export const ToolRecordsWidget = ({
  message,
  recordReferences,
}: ToolRecordsWidgetProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { getIcon } = useIcons();

  const visibleReferences = recordReferences.slice(0, MAX_VISIBLE_RECORDS);
  const hiddenCount = recordReferences.length - visibleReferences.length;

  return (
    <StyledContainer>
      <StyledHeader>{message}</StyledHeader>
      <StyledChips>
        {visibleReferences.map((recordReference) => {
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.nameSingular === recordReference.objectNameSingular,
          );
          const Icon = getIcon(objectMetadataItem?.icon);

          return (
            <LinkChip
              key={recordReference.recordId}
              to={getAppPath(AppPath.RecordShowPage, {
                objectNameSingular: recordReference.objectNameSingular,
                objectRecordId: recordReference.recordId,
              })}
              startElement={isDefined(Icon) ? <Icon size={14} /> : undefined}
            >
              {recordReference.displayName}
            </LinkChip>
          );
        })}
        {hiddenCount > 0 && (
          <StyledOverflow>{t`and ${hiddenCount} more`}</StyledOverflow>
        )}
      </StyledChips>
    </StyledContainer>
  );
};
