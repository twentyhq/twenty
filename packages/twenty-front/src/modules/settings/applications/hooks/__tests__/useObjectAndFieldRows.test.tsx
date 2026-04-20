import { renderHook } from '@testing-library/react';

import { useObjectAndFieldRows } from '@/settings/applications/hooks/useObjectAndFieldRows';
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

describe('useObjectAndFieldRows', () => {
  describe('with installed application', () => {
    it('should return object rows for installed application objects', () => {
      const installedApplication = {
        id: APP_ID,
        objects: [{ id: personObject.id }],
        name: 'Test App',
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useObjectAndFieldRows({
            applicationId: APP_ID,
            installedApplication,
          }),
        { wrapper },
      );

      expect(result.current.objectRows).toHaveLength(1);
      expect(result.current.objectRows[0].key).toBe(personObject.nameSingular);
      expect(result.current.objectRows[0].labelPlural).toBe(
        personObject.labelPlural,
      );
      expect(result.current.objectRows[0].fieldsCount).toBeGreaterThan(0);
      expect(result.current.objectRows[0].link).toBeDefined();
    });

    it('should return empty object rows when application has no objects', () => {
      const installedApplication = {
        id: APP_ID,
        objects: [],
        name: 'Test App',
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useObjectAndFieldRows({
            applicationId: APP_ID,
            installedApplication,
          }),
        { wrapper },
      );

      expect(result.current.objectRows).toHaveLength(0);
    });

    it('should return field group rows for fields added to other objects', () => {
      const fieldBelongingToApp = companyObject.fields[0];

      const installedApplication = {
        id: fieldBelongingToApp.applicationId ?? APP_ID,
        objects: [{ id: personObject.id }],
        name: 'Test App',
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useObjectAndFieldRows({
            applicationId: installedApplication.id,
            installedApplication,
          }),
        { wrapper },
      );

      // Field group rows should not include the app's own objects
      const hasOwnObject = result.current.fieldGroupRows.some(
        (row) => row.key === personObject.nameSingular,
      );
      expect(hasOwnObject).toBe(false);
    });

    it('should exclude deny-listed objects from field group rows', () => {
      const installedApplication = {
        id: APP_ID,
        objects: [],
        name: 'Test App',
        canBeUninstalled: true,
        availablePackages: {},
        applicationVariables: [],
        agents: [],
        logicFunctions: [],
        frontComponents: [],
      };

      const { result } = renderHook(
        () =>
          useObjectAndFieldRows({
            applicationId: APP_ID,
            installedApplication,
          }),
        { wrapper },
      );

      const hasDeniedObject = result.current.fieldGroupRows.some(
        (row) => row.key === 'timelineActivity' || row.key === 'favorite',
      );
      expect(hasDeniedObject).toBe(false);
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
          useObjectAndFieldRows({
            applicationId: 'app-uid',
            manifestContent,
          }),
        { wrapper },
      );

      expect(result.current.objectRows).toHaveLength(1);
      expect(result.current.objectRows[0].key).toBe('customObject');
      expect(result.current.objectRows[0].labelPlural).toBe('Custom Objects');
      expect(result.current.objectRows[0].fieldsCount).toBe(2);
      expect(result.current.objectRows[0].tagItem.applicationId).toBe(
        'app-uid',
      );
    });

    it('should return field group rows grouped by object from manifest fields', () => {
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
            name: 'field1',
          },
          {
            objectUniversalIdentifier: 'custom-obj-uid',
            name: 'field2',
          },
          {
            objectUniversalIdentifier: 'custom-obj-uid',
            name: 'field3',
          },
        ],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useObjectAndFieldRows({
            applicationId: 'app-uid',
            manifestContent,
          }),
        { wrapper },
      );

      expect(result.current.fieldGroupRows).toHaveLength(1);
      expect(result.current.fieldGroupRows[0].key).toBe('customObj');
      expect(result.current.fieldGroupRows[0].fieldsCount).toBe(3);
    });

    it('should return empty field group rows when manifest has no fields', () => {
      const manifestContent = {
        objects: [],
        fields: [],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useObjectAndFieldRows({
            applicationId: 'app-uid',
            manifestContent,
          }),
        { wrapper },
      );

      expect(result.current.fieldGroupRows).toHaveLength(0);
    });

    it('should return empty rows when no data is provided', () => {
      const { result } = renderHook(
        () =>
          useObjectAndFieldRows({
            applicationId: 'app-uid',
          }),
        { wrapper },
      );

      expect(result.current.objectRows).toHaveLength(0);
      expect(result.current.fieldGroupRows).toHaveLength(0);
    });
  });

  describe('data source priority', () => {
    it('should use installed application data when both sources are provided', () => {
      const installedApplication = {
        id: APP_ID,
        objects: [{ id: personObject.id }],
        name: 'Test App',
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
          useObjectAndFieldRows({
            applicationId: APP_ID,
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
