import { isDefined } from 'twenty-shared/utils';

type TranslationRow = {
  property: string;
  value: string;
  canonicalValue: string;
};

// An edit goes "through a translation" when what the viewer reads is not the
// canonical value -- which is what makes it ambiguous whether they meant to
// fix the translation or rename the concept. True for any locale: a workspace
// can hold a translation for the source language too.
export const isEditingThroughTranslation = ({
  dirtyTranslatableProperties,
  translationRows,
}: {
  dirtyTranslatableProperties: readonly string[];
  translationRows: readonly TranslationRow[];
}): boolean =>
  dirtyTranslatableProperties.some((property) => {
    const row = translationRows.find(
      (translationRow) => translationRow.property === property,
    );

    return isDefined(row) && row.value !== row.canonicalValue;
  });
