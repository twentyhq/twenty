import {
  FIELDS_WIDGET_SYSTEM_VIEW_KEY,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemPageLayoutWidgetUniversalIdentifier,
  getSystemRecordPageLayoutUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getSystemViewFieldGroupUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
export const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ad';
export const STANDARD_APPLICATION_ID = 'standard-application-db-id';
export const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000aa';
export const CUSTOM_APPLICATION_ID = 'custom-application-db-id';
export const EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ae';
export const FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000cc';

export const buildDerivedRecordPageStackUniversalIdentifiers = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  fieldApplicationUniversalIdentifier = applicationUniversalIdentifier,
  fieldUniversalIdentifier = FIELD_UNIVERSAL_IDENTIFIER,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  fieldApplicationUniversalIdentifier?: string;
  fieldUniversalIdentifier?: string;
}) => {
  const pageLayout = getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    objectUniversalIdentifier,
  });
  const homeTab = getSystemPageLayoutTabUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    pageLayoutUniversalIdentifier: pageLayout,
    title: 'Home',
  });
  const fieldsWidget = getSystemPageLayoutWidgetUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier: homeTab,
    title: 'Fields',
  });
  const view = getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    objectUniversalIdentifier,
    viewKey: FIELDS_WIDGET_SYSTEM_VIEW_KEY,
  });
  const viewField = getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      fieldApplicationUniversalIdentifier,
    viewUniversalIdentifier: view,
    fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
  });
  const generalGroup = getSystemViewFieldGroupUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    viewUniversalIdentifier: view,
    name: 'General',
  });

  return { pageLayout, homeTab, fieldsWidget, view, viewField, generalGroup };
};

// An underived pre-2.29 stack: v4 identifiers everywhere, no key.
export const buildUnderivedRecordPageStack = ({
  idPrefix,
  objectUniversalIdentifier,
  applicationUniversalIdentifier,
  isSystemSideEffect = true,
  withGroup = false,
}: {
  idPrefix: string;
  objectUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  isSystemSideEffect?: boolean;
  withGroup?: boolean;
}) => {
  const view = {
    id: `${idPrefix}-view-db-id`,
    universalIdentifier: `${idPrefix}-view-universal-identifier`,
    key: null as ViewKey | null,
    isSystemSideEffect,
    deletedAt: null as string | null,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    applicationUniversalIdentifier,
    viewFieldUniversalIdentifiers: [
      `${idPrefix}-view-field-universal-identifier`,
    ],
    viewFieldGroupUniversalIdentifiers: withGroup
      ? [`${idPrefix}-group-universal-identifier`]
      : [],
  };

  const viewField = {
    id: `${idPrefix}-view-field-db-id`,
    universalIdentifier: `${idPrefix}-view-field-universal-identifier`,
    fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
    isSystemSideEffect: false,
    deletedAt: null as string | null,
    applicationUniversalIdentifier,
  };

  const viewFieldGroup = {
    id: `${idPrefix}-group-db-id`,
    universalIdentifier: `${idPrefix}-group-universal-identifier`,
    name: 'General',
    isSystemSideEffect: false,
    deletedAt: null as string | null,
    applicationUniversalIdentifier,
  };

  const fieldsWidget = {
    id: `${idPrefix}-widget-db-id`,
    universalIdentifier: `${idPrefix}-widget-universal-identifier`,
    title: 'Fields',
    isSystemSideEffect,
    deletedAt: null as string | null,
    applicationUniversalIdentifier,
    configuration: {
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: view.id,
      newFieldDefaultVisibility: true,
    },
  };

  const homeTab = {
    id: `${idPrefix}-tab-db-id`,
    universalIdentifier: `${idPrefix}-tab-universal-identifier`,
    title: 'Home',
    isSystemSideEffect,
    deletedAt: null as string | null,
    applicationUniversalIdentifier,
    widgetUniversalIdentifiers: [fieldsWidget.universalIdentifier],
  };

  const pageLayout = {
    id: `${idPrefix}-page-layout-db-id`,
    universalIdentifier: `${idPrefix}-page-layout-universal-identifier`,
    type: PageLayoutType.RECORD_PAGE,
    isSystemSideEffect,
    deletedAt: null as string | null,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    applicationUniversalIdentifier,
    tabUniversalIdentifiers: [homeTab.universalIdentifier],
  };

  return {
    pageLayout,
    homeTab,
    fieldsWidget,
    view,
    viewField,
    viewFieldGroup: withGroup ? viewFieldGroup : undefined,
  };
};

export type FlatEntityFixture = {
  universalIdentifier: string;
  id?: string;
} & Record<string, unknown>;

export const buildByUniversalIdentifierMap = <T extends FlatEntityFixture>(
  flatEntities: T[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities
      .filter((flatEntity) => flatEntity.id !== undefined)
      .map((flatEntity) => [flatEntity.id, flatEntity.universalIdentifier]),
  ),
});
