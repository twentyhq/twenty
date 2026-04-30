import { renderHook } from '@testing-library/react';

import { useComputeObjectAndFieldsContentForApplication } from '@/settings/applications/hooks/useComputeObjectAndFieldsContentForApplication';
import { type Manifest } from 'twenty-shared/application';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockObjectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const personObject = mockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;
const companyObject = mockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

const APP_ID = 'test-app-id';

const wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useComputeObjectAndFieldsContentForApplication', () => {
  describe('with installed application', () => {
    it('should return object rows for installed application objects', () => {
      const installedApplication = {
        id: APP_ID,
        universalIdentifier: APP_ID,
        objects: [{ id: personObject.id }],
        name: 'Test App',
        logo: null,
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            installedApplication,
          }),
        { wrapper },
      );

      expect(result.current.objectRows).toHaveLength(1);
      expect(result.current.objectRows[0].key).toBe(personObject.nameSingular);
      expect(result.current.objectRows[0].name).toBe(personObject.labelPlural);
      expect(result.current.objectRows[0].secondary).toMatch(/\d+ fields/);
      expect(result.current.objectRows[0].link).toBeDefined();
    });

    it('should return empty object rows when application has no objects', () => {
      const installedApplication = {
        id: APP_ID,
        universalIdentifier: APP_ID,
        objects: [],
        name: 'Test App',
        logo: null,
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            installedApplication,
          }),
        { wrapper },
      );

      expect(result.current.objectRows).toHaveLength(0);
    });

    it("should not include the app's own objects among the field rows", () => {
      const fieldBelongingToApp = companyObject.fields[0];

      const installedApplication = {
        id: fieldBelongingToApp.applicationId ?? APP_ID,
        universalIdentifier: fieldBelongingToApp.applicationId ?? APP_ID,
        objects: [{ id: personObject.id }],
        name: 'Test App',
        logo: null,
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            installedApplication,
          }),
        { wrapper },
      );

      const referencesOwnObject = result.current.fieldRows.some((row) =>
        row.secondary?.includes(personObject.labelSingular),
      );
      expect(referencesOwnObject).toBe(false);
    });

    it('should exclude deny-listed objects from field rows', () => {
      const installedApplication = {
        id: APP_ID,
        universalIdentifier: APP_ID,
        objects: [],
        name: 'Test App',
        logo: null,
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            installedApplication,
          }),
        { wrapper },
      );

      const timelineActivityObject = mockObjectMetadataItems.find(
        (item) => item.nameSingular === 'timelineActivity',
      );
      const favoriteObject = mockObjectMetadataItems.find(
        (item) => item.nameSingular === 'favorite',
      );

      const hasDeniedObjectField = result.current.fieldRows.some(
        (row) =>
          row.secondary?.includes(
            timelineActivityObject?.labelSingular ?? '__never__',
          ) ||
          row.secondary?.includes(favoriteObject?.labelSingular ?? '__never__'),
      );
      expect(hasDeniedObjectField).toBe(false);
    });
  });

  describe('with manifest content', () => {
    it('should return object rows from manifest objects', () => {
      const manifestContent = {
        objects: [
          {
            universalIdentifier: 'uid-1',
            nameSingular: 'customObject',
            namePlural: 'customObjects',
            labelSingular: 'Custom Object',
            labelPlural: 'Custom Objects',
            icon: 'IconBox',
            fields: [{ name: 'field1' }, { name: 'field2' }],
          },
        ],
        fields: [],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            manifestContent,
          }),
        { wrapper },
      );

      expect(result.current.objectRows).toHaveLength(1);
      expect(result.current.objectRows[0].key).toBe('customObject');
      expect(result.current.objectRows[0].name).toBe('Custom Objects');
      expect(result.current.objectRows[0].secondary).toBe('2 fields');
    });

    it('should return one row per field when the parent object lives in the manifest', () => {
      const manifestContent = {
        objects: [
          {
            universalIdentifier: 'custom-obj-uid',
            nameSingular: 'customObj',
            namePlural: 'customObjs',
            labelSingular: 'Custom',
            labelPlural: 'Customs',
            icon: 'IconBox',
            fields: [],
          },
        ],
        fields: [
          {
            objectUniversalIdentifier: 'custom-obj-uid',
            universalIdentifier: 'field1-uid',
            name: 'field1',
            label: 'Field 1',
          },
          {
            objectUniversalIdentifier: 'custom-obj-uid',
            universalIdentifier: 'field2-uid',
            name: 'field2',
            label: 'Field 2',
          },
          {
            objectUniversalIdentifier: 'custom-obj-uid',
            universalIdentifier: 'field3-uid',
            name: 'field3',
            label: 'Field 3',
          },
        ],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            manifestContent,
          }),
        { wrapper },
      );

      expect(result.current.fieldRows).toHaveLength(3);
      expect(result.current.fieldRows.map((r) => r.name)).toEqual([
        'Field 1',
        'Field 2',
        'Field 3',
      ]);
      expect(
        result.current.fieldRows.every((r) => r.secondary === 'on Custom'),
      ).toBe(true);
    });

    it('should return empty field rows when manifest has no fields', () => {
      const manifestContent = {
        objects: [],
        fields: [],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            manifestContent,
          }),
        { wrapper },
      );

      expect(result.current.fieldRows).toHaveLength(0);
    });

    it('should return empty rows when no data is provided', () => {
      const { result } = renderHook(
        () => useComputeObjectAndFieldsContentForApplication({}),
        {
          wrapper,
        },
      );

      expect(result.current.objectRows).toHaveLength(0);
      expect(result.current.fieldRows).toHaveLength(0);
    });
  });

  describe('data source priority', () => {
    it('should use installed application data when both sources are provided', () => {
      const installedApplication = {
        id: APP_ID,
        universalIdentifier: APP_ID,
        objects: [{ id: personObject.id }],
        name: 'Test App',
        logo: null,
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const manifestContent = {
        objects: [
          {
            universalIdentifier: 'uid-1',
            nameSingular: 'manifestObj',
            namePlural: 'manifestObjs',
            labelSingular: 'Manifest',
            labelPlural: 'Manifests',
            icon: 'IconBox',
            fields: [],
          },
        ],
        fields: [],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeObjectAndFieldsContentForApplication({
            installedApplication,
            manifestContent,
          }),
        { wrapper },
      );

      // Should use installed data, not manifest
      expect(result.current.objectRows[0].key).toBe(personObject.nameSingular);
      expect(
        result.current.objectRows.some((r) => r.key === 'manifestObj'),
      ).toBe(false);
    });
  });
});
