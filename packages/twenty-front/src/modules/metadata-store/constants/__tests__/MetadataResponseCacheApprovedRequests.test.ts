import { addTypenameToDocument } from '@apollo/client/utilities';
import { createHash } from 'crypto';
import { type DocumentNode, parse, print } from 'graphql';
import { METADATA_RESPONSE_CACHE_APPROVED_REQUESTS } from 'twenty-shared/metadata';

import { INDEX_VIEW_TYPES } from '@/metadata-store/constants/IndexViewTypes';
import { SHARED_VIEW_TYPE_GROUPS } from '@/metadata-store/constants/SharedViewTypeGroups';
import { FIND_SHARED_VIEWS } from '@/views/graphql/queries/findSharedViews';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { FindAllViewsDocument } from '~/generated-metadata/graphql';

const computeWireDocumentFingerprint = (document: DocumentNode) =>
  createHash('sha256')
    .update(print(parse(print(addTypenameToDocument(document)))))
    .digest('hex');

describe('METADATA_RESPONSE_CACHE_APPROVED_REQUESTS', () => {
  it('approves the ObjectMetadataItems document the front sends', () => {
    expect(
      METADATA_RESPONSE_CACHE_APPROVED_REQUESTS.ObjectMetadataItems,
    ).toEqual([
      {
        documentFingerprint: computeWireDocumentFingerprint(
          FIND_MANY_OBJECT_METADATA_ITEMS,
        ),
        variables: {},
      },
    ]);
  });

  it('approves the FindAllViews document and variables the front sends', () => {
    expect(METADATA_RESPONSE_CACHE_APPROVED_REQUESTS.FindAllViews).toEqual([
      {
        documentFingerprint:
          computeWireDocumentFingerprint(FindAllViewsDocument),
        variables: { viewTypes: INDEX_VIEW_TYPES },
      },
    ]);
  });

  it('approves the FindSharedViews document and every view type group the front sends', () => {
    expect(METADATA_RESPONSE_CACHE_APPROVED_REQUESTS.FindSharedViews).toEqual(
      SHARED_VIEW_TYPE_GROUPS.map((viewTypes) => ({
        documentFingerprint: computeWireDocumentFingerprint(FIND_SHARED_VIEWS),
        variables: { viewTypes },
      })),
    );
  });

  it('never approves the private views query', () => {
    expect(
      METADATA_RESPONSE_CACHE_APPROVED_REQUESTS.FindMyPrivateViews,
    ).toBeUndefined();
  });
});
