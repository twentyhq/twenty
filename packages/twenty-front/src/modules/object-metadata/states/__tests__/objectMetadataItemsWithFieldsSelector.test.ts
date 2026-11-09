import { createStore } from 'jotai';

import {
  type CurrentUserWorkspace,
  currentUserWorkspaceState,
} from '@/auth/states/currentUserWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';

const OBJECT_METADATA_ID = 'company-object-metadata-id';
const FIELD_METADATA_ID = 'company-name-field-metadata-id';

const buildStore = (objectRecordsPermissions: Record<string, unknown>) => {
  const store = createStore();

  store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
    current: [{ id: OBJECT_METADATA_ID }],
    draft: [],
    status: 'up-to-date',
  });
  store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
    current: [
      {
        id: FIELD_METADATA_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        icon: 'IconText',
      },
    ],
    draft: [],
    status: 'up-to-date',
  });
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: [],
    twoFactorAuthenticationMethodSummary: [],
    objectRecordsPermissions: [
      { objectMetadataId: OBJECT_METADATA_ID, ...objectRecordsPermissions },
    ],
    isImpersonating: false,
  } as unknown as CurrentUserWorkspace);

  return store;
};

describe('objectMetadataItemsWithFieldsSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should not throw on permissions persisted without the field lists', () => {
    const store = buildStore({ restrictedFields: {} });

    const [objectMetadataItem] = store.get(
      objectMetadataItemsWithFieldsSelector.atom,
    );

    expect(objectMetadataItem.readableFields).toHaveLength(1);
    expect(objectMetadataItem.updatableFields).toHaveLength(1);
  });

  it('should keep restrictions persisted as restrictedFields', () => {
    const store = buildStore({
      restrictedFields: {
        [FIELD_METADATA_ID]: { canRead: false, canUpdate: null },
      },
    });

    const [objectMetadataItem] = store.get(
      objectMetadataItemsWithFieldsSelector.atom,
    );

    expect(objectMetadataItem.readableFields).toHaveLength(0);
    expect(objectMetadataItem.updatableFields).toHaveLength(0);
  });

  it('should prefer the field lists over restrictedFields', () => {
    const store = buildStore({
      unreadableFields: [],
      uneditableFields: [],
      restrictedFields: {
        [FIELD_METADATA_ID]: { canRead: false, canUpdate: false },
      },
    });

    const [objectMetadataItem] = store.get(
      objectMetadataItemsWithFieldsSelector.atom,
    );

    expect(objectMetadataItem.readableFields).toHaveLength(1);
    expect(objectMetadataItem.updatableFields).toHaveLength(1);
  });

  it('should apply the field lists of the current shape', () => {
    const store = buildStore({
      unreadableFields: [FIELD_METADATA_ID],
      uneditableFields: [FIELD_METADATA_ID],
    });

    const [objectMetadataItem] = store.get(
      objectMetadataItemsWithFieldsSelector.atom,
    );

    expect(objectMetadataItem.readableFields).toHaveLength(0);
    expect(objectMetadataItem.updatableFields).toHaveLength(0);
  });
});
