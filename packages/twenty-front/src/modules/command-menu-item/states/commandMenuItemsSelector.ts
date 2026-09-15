import { isCommandMenuItemNavigatingToJunctionObject } from '@/command-menu-item/utils/isCommandMenuItemNavigatingToJunctionObject';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatCommandMenuItem } from '@/metadata-store/types/FlatCommandMenuItem';
import { type FlatFrontComponent } from '@/metadata-store/types/FlatFrontComponent';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { getJunctionObjectMetadataIds } from '@/object-record/record-field/ui/utils/junction/getJunctionObjectMetadataIds';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const commandMenuItemsSelector = createAtomSelector<
  CommandMenuItemFieldsFragment[]
>({
  key: 'commandMenuItemsSelector',
  get: ({ get }) => {
    const commandMenuItems = get(metadataStoreState, 'commandMenuItems')
      .current as FlatCommandMenuItem[];
    const flatFrontComponents = get(metadataStoreState, 'frontComponents')
      .current as FlatFrontComponent[];
    const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);

    const junctionObjectMetadataIds =
      getJunctionObjectMetadataIds(objectMetadataItems);

    const frontComponentsById = new Map(
      flatFrontComponents.map((frontComponent) => [
        frontComponent.id,
        frontComponent,
      ]),
    );

    return commandMenuItems
      .filter((item) => item.isActive)
      .filter(
        (item) =>
          !isCommandMenuItemNavigatingToJunctionObject({
            commandMenuItem: item,
            junctionObjectMetadataIds,
          }),
      )
      .map((item) => ({
        ...item,
        frontComponent: isDefined(item.frontComponentId)
          ? (frontComponentsById.get(item.frontComponentId) ??
            item.frontComponent ??
            null)
          : null,
      })) as CommandMenuItemFieldsFragment[];
  },
});
