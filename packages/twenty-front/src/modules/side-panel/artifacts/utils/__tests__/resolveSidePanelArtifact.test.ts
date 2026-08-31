import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath } from 'twenty-shared/utils';

import { resolveSidePanelArtifact } from '@/side-panel/artifacts/utils/resolveSidePanelArtifact';
import { type View } from '@/views/types/View';
import {
  ViewKey,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const companyNameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const INDEX_VIEW_ID = '22222222-2222-4222-8222-222222222222';
const REQUESTED_VIEW_ID = '33333333-3333-4333-8333-333333333333';
const WIDGET_VIEW_ID = '44444444-4444-4444-8444-444444444444';

const buildCompanyView = (overrides: Partial<View>): View => ({
  id: INDEX_VIEW_ID,
  name: 'All Companies',
  type: ViewType.TABLE,
  key: ViewKey.INDEX,
  objectMetadataId: companyObjectMetadataItem.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconBuildingSkyscraper',
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
  ...overrides,
});

const indexView = buildCompanyView({});
const requestedView = buildCompanyView({
  id: REQUESTED_VIEW_ID,
  name: 'Companies by stage',
  type: ViewType.KANBAN,
  key: null,
  position: 1,
});
const widgetView = buildCompanyView({
  id: WIDGET_VIEW_ID,
  name: 'Companies widget',
  type: ViewType.KANBAN_WIDGET,
  key: null,
  position: 2,
});

const resolveArtifact = ({
  artifactPath,
  views = [indexView, requestedView, widgetView],
  objectMetadataItems = [companyObjectMetadataItem],
}: {
  artifactPath: string;
  views?: View[];
  objectMetadataItems?: (typeof companyObjectMetadataItem)[];
}) =>
  resolveSidePanelArtifact({
    artifactPath,
    objectMetadataItems,
    views,
  });

describe('resolveSidePanelArtifact', () => {
  const recordPath = getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: companyObjectMetadataItem.nameSingular,
    objectRecordId: RECORD_ID,
  });
  const recordIndexPath = getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: companyObjectMetadataItem.namePlural },
    { viewId: REQUESTED_VIEW_ID },
  );
  const settingsFieldPath = getSettingsPath(SettingsPath.ObjectFieldEdit, {
    objectNamePlural: companyObjectMetadataItem.namePlural,
    fieldName: companyNameFieldMetadataItem.name,
  });

  it.each([
    [
      'record',
      recordPath,
      {
        kind: 'record',
        recordId: RECORD_ID,
      },
    ],
    [
      'record index',
      recordIndexPath,
      {
        kind: 'recordIndex',
        view: requestedView,
      },
    ],
    [
      'settings field',
      settingsFieldPath,
      {
        kind: 'settingsField',
        fieldMetadataItem: companyNameFieldMetadataItem,
      },
    ],
  ])('resolves a %s path', (_label, artifactPath, expectedArtifact) => {
    expect(resolveArtifact({ artifactPath })).toMatchObject({
      artifactPath,
      objectMetadataItem: companyObjectMetadataItem,
      ...expectedArtifact,
    });
  });

  it('returns null for a requested widget view', () => {
    const artifactPath = getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: companyObjectMetadataItem.namePlural },
      { viewId: WIDGET_VIEW_ID },
    );

    expect(resolveArtifact({ artifactPath })).toBeNull();
  });

  it('returns null for a requested view that no longer exists', () => {
    const artifactPath = getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: companyObjectMetadataItem.namePlural },
      { viewId: '55555555-5555-4555-8555-555555555555' },
    );

    expect(resolveArtifact({ artifactPath })).toBeNull();
  });

  it('falls back to the first positioned user-facing view without an index view', () => {
    const laterView = buildCompanyView({
      id: '55555555-5555-4555-8555-555555555555',
      key: null,
      position: 5,
    });
    const firstView = buildCompanyView({
      id: '66666666-6666-4666-8666-666666666666',
      key: null,
      position: 2,
    });
    const artifactPath = getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: companyObjectMetadataItem.namePlural,
    });

    expect(
      resolveArtifact({ artifactPath, views: [laterView, firstView] }),
    ).toMatchObject({
      kind: 'recordIndex',
      view: firstView,
    });
  });

  it('returns null when the target metadata became stale', () => {
    expect(
      resolveArtifact({ artifactPath: recordPath, objectMetadataItems: [] }),
    ).toBeNull();
  });

  it('returns null for an unknown field', () => {
    const artifactPath = getSettingsPath(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: companyObjectMetadataItem.namePlural,
      fieldName: 'unknownField',
    });

    expect(resolveArtifact({ artifactPath })).toBeNull();
  });

  it('returns null when an object has no user-facing view', () => {
    const artifactPath = getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: companyObjectMetadataItem.namePlural,
    });

    expect(resolveArtifact({ artifactPath, views: [widgetView] })).toBeNull();
  });

  it('returns null for a path that is not a supported artifact', () => {
    expect(resolveArtifact({ artifactPath: '/chat' })).toBeNull();
  });
});
