import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/components/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import {
  IconBox,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';

export type SettingsDataModelObjectSummaryProps = {
  className?: string;
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'icon' | 'labelSingular' | 'labelPlural' | 'isCustom' | 'isRemote'
  >[];
  pluralizeLabel?: boolean;
};

const StyledObjectSummary = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledObjectName = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 60%;
`;

const StyledOverflowingTextWithTooltip = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledNumber = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

const StyledSeparator = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.background.quaternary};
  height: 1px;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsDataModelObjectSummaryItemProps = {
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'icon' | 'labelSingular' | 'labelPlural' | 'isCustom' | 'isRemote'
  >;
  pluralizeLabel: boolean;
  index: number;
};

const SettingsDataModelObjectSummaryItem = ({
  objectMetadataItem,
  pluralizeLabel = true,
  index,
}: SettingsDataModelObjectSummaryItemProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem.icon);
  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <>
      {index > 0 && <StyledSeparator />}
      <StyledObjectSummary key={`${objectMetadataItem.labelSingular}-${index}`}>
        <StyledObjectName>
          <StyledIconContainer>
            <ObjectIcon
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.md}
            />
          </StyledIconContainer>
          <OverflowingTextWithTooltip
            text={
              pluralizeLabel
                ? objectMetadataItem.labelPlural
                : objectMetadataItem.labelSingular
            }
          />
        </StyledObjectName>
        <SettingsDataModelObjectTypeTag objectTypeLabel={objectTypeLabel} />
      </StyledObjectSummary>
    </>
  );
};

const SettingsDataModelObjectSummaryOtherObjects = ({
  selected,
}: {
  selected: number;
}) => {
  const theme = useTheme();
  return (
    <>
      <StyledSeparator />
      <StyledObjectSummary key={`other-objects`}>
        <StyledObjectName>
          <StyledIconContainer>
            <IconBox
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.md}
              color={theme.font.color.tertiary}
            />
          </StyledIconContainer>
          <StyledOverflowingTextWithTooltip>
            <OverflowingTextWithTooltip text={`Other objects`} />
          </StyledOverflowingTextWithTooltip>
        </StyledObjectName>
        <StyledNumber>
          <OverflowingTextWithTooltip text={`${selected - 3}`} />
        </StyledNumber>
      </StyledObjectSummary>
    </>
  );
};

export const SettingsDataModelObjectSummary = ({
  objectMetadataItems,
  pluralizeLabel = true,
}: SettingsDataModelObjectSummaryProps) => {
  let selected = 0;

  return (
    <>
      {objectMetadataItems.map((objectMetadataItem, index) => {
        selected++;
        return (
          <SettingsDataModelObjectSummaryItem
            objectMetadataItem={objectMetadataItem}
            pluralizeLabel={pluralizeLabel}
            index={index}
          />
        );
      })}
      {selected > 3 && (
        <SettingsDataModelObjectSummaryOtherObjects selected={selected} />
      )}
    </>
  );
};
