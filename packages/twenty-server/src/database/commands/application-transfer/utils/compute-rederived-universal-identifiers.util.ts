import {
  getFieldUniversalIdentifier,
  getIndexUniversalIdentifier,
  getSearchFieldUniversalIdentifier,
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemPageLayoutWidgetUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
  getSystemRecordPageLayoutUniversalIdentifier,
  getSystemRelationFieldUniversalIdentifier,
  getSystemViewFieldGroupUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  SYSTEM_VIEW_KEYS,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

type IdentifiedRow = { id: string; universalIdentifier: string };

export type RederivableRowsByMetadataName = {
  objectMetadata: IdentifiedRow[];
  fieldMetadata: (IdentifiedRow & {
    objectMetadataId: string;
    name: string;
    relationTargetObjectMetadataId: string | null;
  })[];
  index: (IdentifiedRow & { objectMetadataId: string; name: string })[];
  searchFieldMetadata: (IdentifiedRow & { fieldMetadataId: string })[];
  view: (IdentifiedRow & { objectMetadataId: string })[];
  viewField: (IdentifiedRow & { viewId: string; fieldMetadataId: string })[];
  viewFieldGroup: (IdentifiedRow & { viewId: string; name: string })[];
  pageLayout: (IdentifiedRow & { objectMetadataId: string | null })[];
  pageLayoutTab: (IdentifiedRow & { pageLayoutId: string; title: string })[];
  pageLayoutWidget: (IdentifiedRow & {
    pageLayoutTabId: string;
    title: string;
    formFieldMetadataId: string | null;
  })[];
  commandMenuItem: (IdentifiedRow & {
    navigationTargetObjectMetadataId: string | null;
  })[];
};

export type RederivableMetadataName = Exclude<
  keyof RederivableRowsByMetadataName,
  'objectMetadata'
>;

type DerivationContext = {
  applicationUniversalIdentifier: string;
  getUniversalIdentifier: (id: string | null) => string | undefined;
};

type CandidateDerivations<TRow> = (
  row: TRow,
  context: DerivationContext,
) => (string | undefined)[];

const whenDefined = <TValues extends unknown[]>(
  values: [...TValues],
  derive: (
    ...definedValues: { [K in keyof TValues]: NonNullable<TValues[K]> }
  ) => string,
): string | undefined =>
  values.every(isDefined)
    ? derive(...(values as { [K in keyof TValues]: NonNullable<TValues[K]> }))
    : undefined;

// Ordered so a parent is re-derived before the children whose derivation embeds it
const CANDIDATE_DERIVATIONS_BY_METADATA_NAME: {
  [P in RederivableMetadataName]: CandidateDerivations<
    RederivableRowsByMetadataName[P][number]
  >;
} = {
  fieldMetadata: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => {
    const objectUniversalIdentifier = getUniversalIdentifier(
      row.objectMetadataId,
    );

    return [
      whenDefined([objectUniversalIdentifier], (objectUniversalIdentifier) =>
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier,
          name: row.name,
        }),
      ),
      whenDefined(
        [
          objectUniversalIdentifier,
          getUniversalIdentifier(row.relationTargetObjectMetadataId),
        ],
        (objectUniversalIdentifier, relationTargetObjectUniversalIdentifier) =>
          getSystemRelationFieldUniversalIdentifier({
            applicationUniversalIdentifier,
            objectUniversalIdentifier,
            relationTargetObjectUniversalIdentifier,
          }),
      ),
    ];
  },
  index: (row, { applicationUniversalIdentifier, getUniversalIdentifier }) => [
    whenDefined(
      [getUniversalIdentifier(row.objectMetadataId)],
      (objectUniversalIdentifier) =>
        getIndexUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier,
          name: row.name,
        }),
    ),
  ],
  searchFieldMetadata: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => [
    whenDefined(
      [getUniversalIdentifier(row.fieldMetadataId)],
      (fieldMetadataUniversalIdentifier) =>
        getSearchFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          fieldMetadataUniversalIdentifier,
        }),
    ),
  ],
  view: (row, { applicationUniversalIdentifier, getUniversalIdentifier }) => {
    const objectUniversalIdentifier = getUniversalIdentifier(
      row.objectMetadataId,
    );

    return [
      ...Object.values(SYSTEM_VIEW_KEYS).map((viewKey) =>
        whenDefined([objectUniversalIdentifier], (objectUniversalIdentifier) =>
          getSystemViewUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            objectUniversalIdentifier,
            viewKey,
          }),
        ),
      ),
      whenDefined([objectUniversalIdentifier], (objectUniversalIdentifier) =>
        getInitialObjectViewUniversalIdentifier({
          viewApplicationUniversalIdentifier: applicationUniversalIdentifier,
          objectUniversalIdentifier,
        }),
      ),
    ];
  },
  viewField: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => [
    whenDefined(
      [
        getUniversalIdentifier(row.viewId),
        getUniversalIdentifier(row.fieldMetadataId),
      ],
      (viewUniversalIdentifier, fieldMetadataUniversalIdentifier) =>
        getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          viewUniversalIdentifier,
          fieldMetadataUniversalIdentifier,
        }),
    ),
  ],
  viewFieldGroup: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => [
    whenDefined(
      [getUniversalIdentifier(row.viewId)],
      (viewUniversalIdentifier) =>
        getSystemViewFieldGroupUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          viewUniversalIdentifier,
          name: row.name,
        }),
    ),
  ],
  pageLayout: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => {
    const objectUniversalIdentifier = getUniversalIdentifier(
      row.objectMetadataId,
    );

    return [
      getSystemRecordPageLayoutUniversalIdentifier,
      getSystemRecordFormPageLayoutUniversalIdentifier,
    ].map((derivePageLayoutUniversalIdentifier) =>
      whenDefined([objectUniversalIdentifier], (objectUniversalIdentifier) =>
        derivePageLayoutUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          objectUniversalIdentifier,
        }),
      ),
    );
  },
  pageLayoutTab: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => [
    whenDefined(
      [getUniversalIdentifier(row.pageLayoutId)],
      (pageLayoutUniversalIdentifier) =>
        getSystemPageLayoutTabUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          pageLayoutUniversalIdentifier,
          title: row.title,
        }),
    ),
  ],
  pageLayoutWidget: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => {
    const pageLayoutTabUniversalIdentifier = getUniversalIdentifier(
      row.pageLayoutTabId,
    );

    return [
      whenDefined(
        [pageLayoutTabUniversalIdentifier],
        (pageLayoutTabUniversalIdentifier) =>
          getSystemPageLayoutWidgetUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            pageLayoutTabUniversalIdentifier,
            title: row.title,
          }),
      ),
      whenDefined(
        [
          pageLayoutTabUniversalIdentifier,
          getUniversalIdentifier(row.formFieldMetadataId),
        ],
        (pageLayoutTabUniversalIdentifier, fieldMetadataUniversalIdentifier) =>
          getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            pageLayoutTabUniversalIdentifier,
            fieldMetadataUniversalIdentifier,
          }),
      ),
    ];
  },
  commandMenuItem: (
    row,
    { applicationUniversalIdentifier, getUniversalIdentifier },
  ) => [
    whenDefined(
      [getUniversalIdentifier(row.navigationTargetObjectMetadataId)],
      (objectUniversalIdentifier) =>
        getSystemNavigationCommandMenuItemUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          objectUniversalIdentifier,
        }),
    ),
  ],
};

export type RederivedUniversalIdentifier = {
  id: string;
  previousUniversalIdentifier: string;
  universalIdentifier: string;
};

// An engine-derived identifier is recognised by recomputing its derivation with the source
// application, then recomputed with the destination one; author-declared identifiers never match.
export const computeRederivedUniversalIdentifiers = ({
  rowsByMetadataName,
  sourceApplicationUniversalIdentifier,
  destinationApplicationUniversalIdentifier,
}: {
  rowsByMetadataName: RederivableRowsByMetadataName;
  sourceApplicationUniversalIdentifier: string;
  destinationApplicationUniversalIdentifier: string;
}): Record<RederivableMetadataName, RederivedUniversalIdentifier[]> => {
  const previousUniversalIdentifierById = new Map<string, string>(
    Object.values(rowsByMetadataName).flatMap((rows: IdentifiedRow[]) =>
      rows.map(({ id, universalIdentifier }) => [id, universalIdentifier]),
    ),
  );
  const rederivedUniversalIdentifierById = new Map<string, string>();

  const buildContext = ({
    applicationUniversalIdentifier,
    isRederived,
  }: {
    applicationUniversalIdentifier: string;
    isRederived: boolean;
  }): DerivationContext => ({
    applicationUniversalIdentifier,
    getUniversalIdentifier: (id) => {
      if (!isDefined(id)) {
        return undefined;
      }

      return (
        (isRederived ? rederivedUniversalIdentifierById.get(id) : undefined) ??
        previousUniversalIdentifierById.get(id)
      );
    },
  });

  const sourceContext = buildContext({
    applicationUniversalIdentifier: sourceApplicationUniversalIdentifier,
    isRederived: false,
  });
  const destinationContext = buildContext({
    applicationUniversalIdentifier: destinationApplicationUniversalIdentifier,
    isRederived: true,
  });

  const rederivedByMetadataName = {} as Record<
    RederivableMetadataName,
    RederivedUniversalIdentifier[]
  >;

  for (const metadataName of Object.keys(
    CANDIDATE_DERIVATIONS_BY_METADATA_NAME,
  ) as RederivableMetadataName[]) {
    const deriveCandidates = CANDIDATE_DERIVATIONS_BY_METADATA_NAME[
      metadataName
    ] as CandidateDerivations<
      RederivableRowsByMetadataName[typeof metadataName][number]
    >;

    rederivedByMetadataName[metadataName] = [];

    for (const row of rowsByMetadataName[metadataName]) {
      const matchingCandidateIndex = deriveCandidates(
        row,
        sourceContext,
      ).findIndex(
        (candidateUniversalIdentifier) =>
          candidateUniversalIdentifier === row.universalIdentifier,
      );

      if (matchingCandidateIndex === -1) {
        continue;
      }

      const universalIdentifier = deriveCandidates(row, destinationContext)[
        matchingCandidateIndex
      ];

      if (!isDefined(universalIdentifier)) {
        continue;
      }

      rederivedUniversalIdentifierById.set(row.id, universalIdentifier);
      rederivedByMetadataName[metadataName].push({
        id: row.id,
        previousUniversalIdentifier: row.universalIdentifier,
        universalIdentifier,
      });
    }
  }

  return rederivedByMetadataName;
};
