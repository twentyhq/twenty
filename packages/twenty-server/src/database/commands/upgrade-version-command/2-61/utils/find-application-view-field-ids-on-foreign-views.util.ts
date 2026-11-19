import { isDefined } from 'twenty-shared/utils';

import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const findApplicationViewFieldIdsOnForeignViews = ({
  flatViewFields,
  flatViewByUniversalIdentifier,
  engineOwnedApplicationUniversalIdentifiers,
}: {
  flatViewFields: Pick<
    FlatViewField,
    | 'id'
    | 'applicationUniversalIdentifier'
    | 'viewUniversalIdentifier'
    | 'isSystemSideEffect'
  >[];
  flatViewByUniversalIdentifier: Partial<
    Record<string, Pick<FlatView, 'applicationUniversalIdentifier'>>
  >;
  engineOwnedApplicationUniversalIdentifiers: Set<string>;
}): string[] =>
  flatViewFields
    .filter((flatViewField) => {
      const flatView =
        flatViewByUniversalIdentifier[flatViewField.viewUniversalIdentifier];

      return (
        isDefined(flatView) &&
        !flatViewField.isSystemSideEffect &&
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatViewField.applicationUniversalIdentifier,
        ) &&
        flatView.applicationUniversalIdentifier !==
          flatViewField.applicationUniversalIdentifier
      );
    })
    .map(({ id }) => id);
