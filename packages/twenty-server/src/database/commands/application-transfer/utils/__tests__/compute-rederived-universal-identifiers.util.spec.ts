import {
  getFieldUniversalIdentifier,
  getSearchFieldUniversalIdentifier,
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  SYSTEM_VIEW_KEYS,
} from 'twenty-shared/application';

import {
  computeRederivedUniversalIdentifiers,
  type RederivableRowsByMetadataName,
} from 'src/database/commands/application-transfer/utils/compute-rederived-universal-identifiers.util';

const SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7a1b6a4c-1111-4c3e-9a3f-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7a1b6a4c-2222-4c3e-9a3f-000000000002';
const OBJECT_UNIVERSAL_IDENTIFIER = '7a1b6a4c-3333-4c3e-9a3f-000000000003';
const AUTHOR_FIELD_UNIVERSAL_IDENTIFIER =
  '7a1b6a4c-4444-4c3e-9a3f-000000000004';

const EMPTY_ROWS: RederivableRowsByMetadataName = {
  objectMetadata: [],
  fieldMetadata: [],
  index: [],
  searchFieldMetadata: [],
  view: [],
  viewField: [],
  viewFieldGroup: [],
  pageLayout: [],
  pageLayoutTab: [],
  pageLayoutWidget: [],
  commandMenuItem: [],
};

const deriveFieldUniversalIdentifier = (
  applicationUniversalIdentifier: string,
  name: string,
) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    name,
  });

const deriveIndexViewUniversalIdentifier = (
  applicationUniversalIdentifier: string,
) =>
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: SYSTEM_VIEW_KEYS.INDEX,
  });

const ROWS: RederivableRowsByMetadataName = {
  ...EMPTY_ROWS,
  objectMetadata: [
    { id: 'object-id', universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER },
  ],
  fieldMetadata: [
    {
      id: 'id-field-id',
      universalIdentifier: deriveFieldUniversalIdentifier(
        SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
        'id',
      ),
      objectMetadataId: 'object-id',
      name: 'id',
      relationTargetObjectMetadataId: null,
    },
    {
      id: 'author-field-id',
      universalIdentifier: AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataId: 'object-id',
      name: 'amount',
      relationTargetObjectMetadataId: null,
    },
  ],
  searchFieldMetadata: [
    {
      id: 'search-field-id',
      universalIdentifier: getSearchFieldUniversalIdentifier({
        applicationUniversalIdentifier: SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: deriveFieldUniversalIdentifier(
          SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
          'id',
        ),
      }),
      fieldMetadataId: 'id-field-id',
    },
  ],
  view: [
    {
      id: 'index-view-id',
      universalIdentifier: deriveIndexViewUniversalIdentifier(
        SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
      objectMetadataId: 'object-id',
    },
  ],
  viewField: [
    {
      id: 'author-view-field-id',
      universalIdentifier: getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: deriveIndexViewUniversalIdentifier(
          SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
        ),
        fieldMetadataUniversalIdentifier: AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
      }),
      viewId: 'index-view-id',
      fieldMetadataId: 'author-field-id',
    },
  ],
  commandMenuItem: [
    {
      id: 'navigation-command-id',
      universalIdentifier:
        getSystemNavigationCommandMenuItemUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      navigationTargetObjectMetadataId: 'object-id',
    },
  ],
};

describe('computeRederivedUniversalIdentifiers', () => {
  const rederivedByMetadataName = computeRederivedUniversalIdentifiers({
    rowsByMetadataName: ROWS,
    sourceApplicationUniversalIdentifier:
      SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
    destinationApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  it('should re-derive engine-derived fields with the destination application', () => {
    expect(rederivedByMetadataName.fieldMetadata).toEqual([
      {
        id: 'id-field-id',
        previousUniversalIdentifier: deriveFieldUniversalIdentifier(
          SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
          'id',
        ),
        universalIdentifier: deriveFieldUniversalIdentifier(
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          'id',
        ),
      },
    ]);
  });

  it('should keep author-declared identifiers', () => {
    expect(
      rederivedByMetadataName.fieldMetadata.map(({ id }) => id),
    ).not.toContain('author-field-id');
  });

  it('should chain derivations through re-derived parents', () => {
    expect(rederivedByMetadataName.searchFieldMetadata).toEqual([
      expect.objectContaining({
        universalIdentifier: getSearchFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: deriveFieldUniversalIdentifier(
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            'id',
          ),
        }),
      }),
    ]);
    expect(rederivedByMetadataName.viewField).toEqual([
      expect.objectContaining({
        universalIdentifier: getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: deriveIndexViewUniversalIdentifier(
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          ),
          fieldMetadataUniversalIdentifier: AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      }),
    ]);
  });

  it('should re-derive the navigation command the object side effects look up', () => {
    expect(rederivedByMetadataName.commandMenuItem).toEqual([
      expect.objectContaining({
        universalIdentifier:
          getSystemNavigationCommandMenuItemUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          }),
      }),
    ]);
  });

  it('should leave rows derived from another application untouched', () => {
    expect(
      computeRederivedUniversalIdentifiers({
        rowsByMetadataName: ROWS,
        sourceApplicationUniversalIdentifier:
          '7a1b6a4c-5555-4c3e-9a3f-000000000005',
        destinationApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      }).fieldMetadata,
    ).toEqual([]);
  });
});
