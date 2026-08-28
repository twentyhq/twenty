import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { useOpenSettingsObjectMetadataInSidePanel } from '@/side-panel/hooks/useOpenSettingsObjectMetadataInSidePanel';
import { SidePanelSettingsMetadataSummary } from '@/side-panel/pages/settings-metadata/components/SidePanelSettingsMetadataSummary';
import { viewableFieldMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableFieldMetadataIdComponentState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const PROPOSED_FIELD_ICON = 'IconTag';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
`;

export const SidePanelSettingsFieldMetadataPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { openSettingsObjectMetadataInSidePanel } =
    useOpenSettingsObjectMetadataInSidePanel();

  const viewableFieldMetadataId = useAtomComponentStateValue(
    viewableFieldMetadataIdComponentState,
  );

  const { foundFieldMetadataItem, foundObjectMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId: viewableFieldMetadataId ?? '',
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
      <SidePanelSettingsMetadataSummary
        Icon={FieldIcon}
        label={foundFieldMetadataItem.label}
        apiName={foundFieldMetadataItem.name}
        description={foundFieldMetadataItem.description}
      >
        {isFieldTypeSupportedInSettings(foundFieldMetadataItem.type) && (
          <SettingsObjectFieldDataType value={foundFieldMetadataItem.type} />
        )}
      </SidePanelSettingsMetadataSummary>
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
            openSettingsObjectMetadataInSidePanel({
              objectMetadataId: foundObjectMetadataItem.id,
            })
          }
        />
      </SidePanelGroup>
    </StyledContainer>
  );
};
