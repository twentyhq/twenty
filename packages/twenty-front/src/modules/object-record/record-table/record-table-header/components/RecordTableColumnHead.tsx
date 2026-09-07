import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useId } from 'react';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_CELL_CONTENT_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellContentClassName';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIcons } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledIcon = styled.div`
  display: flex;
  flex-shrink: 0;

  & > svg {
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type RecordTableColumnHeadProps = {
  recordField: RecordField;
};

export const RecordTableColumnHead = ({
  recordField,
}: RecordTableColumnHeadProps) => {
  const { theme } = useContext(ThemeContext);
  const tooltipAnchorId = useId();
  const descriptionId = `${tooltipAnchorId}-description`;

  const correspondingFieldMetadataItem = useAtomFamilySelectorValue(
    fieldMetadataItemByIdSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
  );

  const { getIcon } = useIcons();
  const Icon = getIcon(
    correspondingFieldMetadataItem.foundFieldMetadataItem?.icon,
  );
  const fieldMetadataItem =
    correspondingFieldMetadataItem.foundFieldMetadataItem;
  const hasDescription =
    isNonEmptyString(fieldMetadataItem?.label) &&
    isNonEmptyString(fieldMetadataItem?.description);

  return (
    <StyledTitle className={RECORD_TABLE_CELL_CONTENT_CLASS_NAME}>
      <StyledIcon>
        <Icon size={theme.icon.size.md} />
      </StyledIcon>
      <StyledText
        data-tooltip-id={hasDescription ? tooltipAnchorId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={hasDescription ? 0 : undefined}
      >
        {fieldMetadataItem?.label}
      </StyledText>
      {hasDescription && (
        <>
          <span id={descriptionId} hidden>
            {fieldMetadataItem?.description}
          </span>
          <AppTooltip
            anchorSelect={`[data-tooltip-id='${tooltipAnchorId}']`}
            title={fieldMetadataItem?.label}
            description={fieldMetadataItem?.description ?? undefined}
            delay={TooltipDelay.longDelay}
            noArrow
            place="bottom"
            positionStrategy="fixed"
            maxWidth="300px"
          />
        </>
      )}
    </StyledTitle>
  );
};
