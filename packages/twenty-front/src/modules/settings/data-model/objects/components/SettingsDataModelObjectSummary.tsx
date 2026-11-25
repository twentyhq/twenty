import { styled } from '@linaria/react';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconBox } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

const MAX_VISIBLE_OBJECTS = 3;

export type SettingsDataModelObjectPreviewProps = {
  className?: string;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    | 'icon'
    | 'labelSingular'
    | 'labelPlural'
    | 'applicationId'
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
    | 'applicationId'
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
  const theme = useTheme();

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
  objectLabels,
}: {
  objectLabels: string[];
}) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <>
      <StyledSeparator />
      <Tooltip
        content={formatDisplayList(objectLabels)}
        side="bottom"
        delay={TooltipDelay.shortDelay}
      >
        <StyledObjectPreview>
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
            <OverflowingTextWithTooltip text={`${objectLabels.length}`} />
          </StyledNumber>
        </StyledObjectPreview>
      </Tooltip>
    </>
  );
};

export const SettingsDataModelObjectPreview = ({
  objectMetadataItems,
  pluralizeLabel = true,
}: SettingsDataModelObjectPreviewProps) => {
  const otherObjectLabels = objectMetadataItems
    .slice(MAX_VISIBLE_OBJECTS)
    .map(({ labelPlural, labelSingular }) =>
      pluralizeLabel ? labelPlural : labelSingular,
    );

  return (
    <>
      {objectMetadataItems
        .slice(0, MAX_VISIBLE_OBJECTS)
        .map((objectMetadataItem, index) => (
          <SettingsDataModelObjectPreviewItem
            key={`${objectMetadataItem.labelSingular}-${index}`}
            objectMetadataItem={objectMetadataItem}
            pluralizeLabel={pluralizeLabel}
            index={index}
          />
        ))}
      {isNonEmptyArray(otherObjectLabels) && (
        <SettingsDataModelObjectPreviewOtherObjects
          objectLabels={otherObjectLabels}
        />
      )}
    </>
  );
};
