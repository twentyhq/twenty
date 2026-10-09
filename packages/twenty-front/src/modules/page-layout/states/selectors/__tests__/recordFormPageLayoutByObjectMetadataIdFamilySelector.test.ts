import { createStore } from 'jotai';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { recordFormPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordFormPageLayoutByObjectMetadataIdFamilySelector';
import { PageLayoutType } from '~/generated-metadata/graphql';

const OBJECT_METADATA_ID = 'company-object';

const buildWidget = (id: string, isActive: boolean) => ({
  id,
  pageLayoutTabId: 'record-form-tab',
  isActive,
});

describe('recordFormPageLayoutByObjectMetadataIdFamilySelector', () => {
  it('should keep the hidden widgets that record page layouts leave out', () => {
    const store = createStore();

    store.set(metadataStoreState.atomFamily('pageLayouts'), {
      current: [
        {
          id: 'record-form',
          type: PageLayoutType.RECORD_FORM,
          objectMetadataId: OBJECT_METADATA_ID,
          isSystemSideEffect: true,
        },
      ],
      draft: [],
      status: 'up-to-date',
    });
    store.set(metadataStoreState.atomFamily('pageLayoutTabs'), {
      current: [{ id: 'record-form-tab', pageLayoutId: 'record-form' }],
      draft: [],
      status: 'up-to-date',
    });
    store.set(metadataStoreState.atomFamily('pageLayoutWidgets'), {
      current: [
        buildWidget('visible-widget', true),
        buildWidget('hidden-widget', false),
      ],
      draft: [],
      status: 'up-to-date',
    });

    const recordFormPageLayout = store.get(
      recordFormPageLayoutByObjectMetadataIdFamilySelector.selectorFamily({
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    );
    const [pageLayoutWithRelations] = store.get(
      pageLayoutsWithRelationsSelector.atom,
    );

    expect(
      recordFormPageLayout?.tabs[0].widgets?.map(({ id, isActive }) => [
        id,
        isActive,
      ]),
    ).toEqual([
      ['visible-widget', true],
      ['hidden-widget', false],
    ]);
    expect(
      pageLayoutWithRelations.tabs[0].widgets?.map(({ id }) => id),
    ).toEqual(['visible-widget']);
  });
});
