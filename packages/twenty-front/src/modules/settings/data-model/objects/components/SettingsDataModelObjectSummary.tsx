import { t } from '@lingui/core/macro';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  IconBox,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';

export type SettingsDataModelObjectPreviewProps = {
  className?: string;
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'icon' | 'labelSingular' | 'labelPlural' | 'isCustom' | 'isRemote'
  >[];
  pluralizeLabel?: boolean;
};

const StyledObjectPreview = styled.div`
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

type SettingsDataModelObjectPreviewItemProps = {
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'icon' | 'labelSingular' | 'labelPlural' | 'isCustom' | 'isRemote'
  >;
  pluralizeLabel: boolean;
  index: number;
};

const SettingsDataModelObjectPreviewItem = ({
  objectMetadataItem,
  pluralizeLabel = true,
  index,
}: SettingsDataModelObjectPreviewItemProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem.icon);

  return (
    <>
      {index > 0 && <StyledSeparator />}
      <StyledObjectPreview key={`${objectMetadataItem.labelSingular}-${index}`}>
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
        <SettingsItemTypeTag item={objectMetadataItem} />
      </StyledObjectPreview>
    </>
  );
};

const SettingsDataModelObjectPreviewOtherObjects = ({
  selected,
}: {
  selected: number;
}) => {
  const theme = useTheme();
  return (
    <>
      <StyledSeparator />
      <StyledObjectPreview key={`other-objects`}>
        <StyledObjectName>
          <StyledIconContainer>
            <IconBox
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.md}
              color={theme.font.color.tertiary}
            />
          </StyledIconContainer>
          <StyledOverflowingTextWithTooltip>
            <OverflowingTextWithTooltip text={t`Other objects`} />
          </StyledOverflowingTextWithTooltip>
        </StyledObjectName>
        <StyledNumber>
          <OverflowingTextWithTooltip text={`${selected - 3}`} />
        </StyledNumber>
      </StyledObjectPreview>
    </>
  );
};

export const SettingsDataModelObjectPreview = ({
  objectMetadataItems,
  pluralizeLabel = true,
}: SettingsDataModelObjectPreviewProps) => {
  let selected = 0;

  return (
    <>
      {objectMetadataItems.map((objectMetadataItem, index) => {
        selected++;
        return selected <= 3 ? (
          <SettingsDataModelObjectPreviewItem
            key={`${objectMetadataItem.labelSingular}-${index}`}
            objectMetadataItem={objectMetadataItem}
            pluralizeLabel={pluralizeLabel}
            index={index}
          />
        ) : (
          <></>
        );
      })}
      {selected > 3 && (
        <SettingsDataModelObjectPreviewOtherObjects selected={selected} />
      )}
    </>
  );
};
