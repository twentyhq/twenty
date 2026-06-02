import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { IconBox, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export type SettingsDataModelObjectPreviewProps = {
  className?: string;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    | 'icon'
    | 'labelSingular'
    | 'labelPlural'
    | 'isCustom'
    | 'isRemote'
    | 'nameSingular'
    | 'color'
    | 'isSystem'
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
  gap: ${themeCssVariables.spacing[2]};
  max-width: 60%;
`;

const StyledOverflowingTextWithTooltip = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledNumber = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

const StyledSeparator = styled.div`
  align-self: stretch;
  background: ${themeCssVariables.background.quaternary};
  height: 1px;
  margin-bottom: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsDataModelObjectPreviewItemProps = {
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    | 'icon'
    | 'labelSingular'
    | 'labelPlural'
    | 'isCustom'
    | 'isRemote'
    | 'nameSingular'
    | 'color'
    | 'isSystem'
  >;
  pluralizeLabel: boolean;
  index: number;
};

const SettingsDataModelObjectPreviewItem = ({
  objectMetadataItem,
  pluralizeLabel = true,
  index,
}: SettingsDataModelObjectPreviewItemProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      {index > 0 && <StyledSeparator />}
      <StyledObjectPreview key={`${objectMetadataItem.labelSingular}-${index}`}>
        <StyledObjectName>
          <StyledIconContainer>
            <ObjectMetadataIcon
              objectMetadataItem={objectMetadataItem}
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
  const { theme } = useContext(ThemeContext);

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
