import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatCommandMenuItem } from '@/metadata-store/types/FlatCommandMenuItem';
import { type FlatFrontComponent } from '@/metadata-store/types/FlatFrontComponent';
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

    const frontComponentsById = new Map(
      flatFrontComponents.map((frontComponent) => [
        frontComponent.id,
        frontComponent,
      ]),
    );

    return commandMenuItems.map((item) => ({
      ...item,
      frontComponent: isDefined(item.frontComponentId)
        ? (frontComponentsById.get(item.frontComponentId) ??
          item.frontComponent ??
          null)
        : null,
    })) as CommandMenuItemFieldsFragment[];
  },
});
