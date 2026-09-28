import { objectColorsDraftState } from '@/layout-customization/states/objectColorsDraftState';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { ThemeColorPickerMenu } from '@/ui/input/components/ThemeColorPickerMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { NavigationDrawerItemEditingContext } from '@/ui/navigation/navigation-drawer/contexts/NavigationDrawerItemEditingContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  PermissionFlagType,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

const StyledIconButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  padding: 0;
`;

type NavigationMenuItemObjectColorEditorProps = {
  item: NavigationMenuItem;
  children: ReactNode;
};

export const NavigationMenuItemObjectColorEditor = ({
  item,
  children,
}: NavigationMenuItemObjectColorEditorProps) => {
  const { t } = useLingui();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const objectMetadataItemsWithFields = useAtomStateValue(
    objectMetadataItemsWithFieldsSelector,
  );
  const setObjectColorsDraft = useSetAtomState(objectColorsDraftState);
  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );
  const { closeDropdown } = useCloseDropdown();
  const dropdownId = `navigation-item-${item.id}-color`;
  const object = objectMetadataItems.find(
    (object) => object.id === item.targetObjectMetadataId,
  );
  const persistedObject = objectMetadataItemsWithFields.find(
    (object) => object.id === item.targetObjectMetadataId,
  );

  if (!isDefined(object) || object.isSystem || !hasDataModelPermission) {
    return children;
  }

  return (
    <NavigationDrawerItemEditingContext.Provider
      value={{
        label: undefined,
        isSelected: false,
        icon: (
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="right-start"
            clickableComponent={
              <StyledIconButton
                type="button"
                aria-label={t`Change object color`}
              >
                <ObjectMetadataIcon objectMetadataItem={object} />
              </StyledIconButton>
            }
            dropdownComponents={
              <LegacyDropdownContent>
                <ThemeColorPickerMenu
                  selectedColor={getObjectColorWithFallback(object)}
                  onSelectColor={(color) => {
                    setObjectColorsDraft((draft) => {
                      const { [object.id]: _previousColor, ...otherColors } =
                        draft;

                      if (
                        color === getObjectColorWithFallback(persistedObject)
                      ) {
                        return otherColors;
                      }

                      return { ...otherColors, [object.id]: color };
                    });
                    closeDropdown(dropdownId);
                  }}
                />
              </LegacyDropdownContent>
            }
          />
        ),
      }}
    >
      {children}
    </NavigationDrawerItemEditingContext.Provider>
  );
};
