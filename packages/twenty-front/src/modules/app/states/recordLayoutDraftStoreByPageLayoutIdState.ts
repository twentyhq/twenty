import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { PageLayoutType } from '~/generated-metadata/graphql';

export type RecordLayoutDraftEntry = {
  pageLayoutDraft: DraftPageLayout;
  fieldsWidgetGroupsDraft: Record<string, FieldsWidgetGroup[]>;
  fieldsWidgetUngroupedFieldsDraft: Record<string, FieldsWidgetGroupField[]>;
  fieldsWidgetEditorModeDraft: Record<string, FieldsWidgetEditorMode>;
  hasInitializedFieldsWidgetGroupsDraft: Record<string, boolean>;
};

export const getDefaultRecordLayoutDraftEntry = (): RecordLayoutDraftEntry => ({
  pageLayoutDraft: {
    id: '',
    name: '',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    tabs: [],
  },
  fieldsWidgetGroupsDraft: {},
  fieldsWidgetUngroupedFieldsDraft: {},
  fieldsWidgetEditorModeDraft: {},
  hasInitializedFieldsWidgetGroupsDraft: {},
});

export const recordLayoutDraftStoreByPageLayoutIdState = createAtomState<
  Record<string, RecordLayoutDraftEntry>
>({
  key: 'recordLayoutDraftStoreByPageLayoutIdState',
  defaultValue: {},
});
