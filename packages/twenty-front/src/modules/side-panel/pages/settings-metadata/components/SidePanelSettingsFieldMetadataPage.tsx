import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { useOpenSidePanelArtifact } from '@/side-panel/artifacts/hooks/useOpenSidePanelArtifact';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const PROPOSED_FIELD_ICON = 'IconTag';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledIdentity = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledApiName = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
`;

type SidePanelSettingsFieldMetadataPageProps = {
  fieldMetadataId: string;
};

export const SidePanelSettingsFieldMetadataPage = ({
  fieldMetadataId,
}: SidePanelSettingsFieldMetadataPageProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const theme = useTheme();
  const { openSidePanelArtifact } = useOpenSidePanelArtifact();

  const { foundFieldMetadataItem, foundObjectMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId: fieldMetadataId,
    });

  if (
    !isDefined(foundFieldMetadataItem) ||
    !isDefined(foundObjectMetadataItem)
  ) {
    return null;
  }

  const FieldIcon = getIcon(foundFieldMetadataItem.icon, PROPOSED_FIELD_ICON);
  const ObjectIcon = getIcon(foundObjectMetadataItem.icon);
  const fieldOptions = foundFieldMetadataItem.options ?? [];

  return (
    <StyledContainer>
      <StyledSummary>
        <StyledIdentity>
          <FieldIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          <StyledLabel>{foundFieldMetadataItem.label}</StyledLabel>
        </StyledIdentity>
        <StyledApiName>{foundFieldMetadataItem.name}</StyledApiName>
        {isNonEmptyString(foundFieldMetadataItem.description) && (
          <StyledDescription>
            {foundFieldMetadataItem.description}
          </StyledDescription>
        )}
        {isFieldTypeSupportedInSettings(foundFieldMetadataItem.type) && (
          <SettingsObjectFieldDataType value={foundFieldMetadataItem.type} />
        )}
      </StyledSummary>
      {fieldOptions.length > 0 && (
        <SidePanelGroup heading={t`Options`}>
          <StyledOptions>
            {fieldOptions.map((fieldOption) => (
              <Tag
                key={fieldOption.id}
                color={fieldOption.color}
                text={fieldOption.label}
              />
            ))}
          </StyledOptions>
        </SidePanelGroup>
      )}
      <SidePanelGroup heading={t`Object`}>
        <MenuItem
          LeftIcon={ObjectIcon}
          text={foundObjectMetadataItem.labelPlural}
          onClick={() =>
            openSidePanelArtifact({
              artifactPath: getAppPath(AppPath.RecordIndexPage, {
                objectNamePlural: foundObjectMetadataItem.namePlural,
              }),
            })
          }
        />
      </SidePanelGroup>
    </StyledContainer>
  );
};
