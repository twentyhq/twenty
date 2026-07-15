import {
  FieldMetadataType,
  type ObjectsPermissions,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { type GroupByQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type GroupByWithRecordsService } from 'src/engine/api/graphql/graphql-query-runner/group-by/services/group-by-with-records.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { type ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { type ObjectLiteral } from 'typeorm';

describe('CommonGroupByQueryRunnerService view filters', () => {
  const objectMetadataId = 'object-id';
  const objectMetadataUniversalIdentifier = 'object-universal-id';
  const visibleFieldId = 'visible-field-id';
  const restrictedFieldId = 'restricted-field-id';

  const visibleField = {
    id: visibleFieldId,
    name: 'visibleText',
    label: 'Visible text',
    type: FieldMetadataType.TEXT,
    isNullable: true,
    objectMetadataId,
    universalIdentifier: 'visible-field-universal-id',
  } as FlatFieldMetadata;

  const restrictedField = {
    id: restrictedFieldId,
    name: 'restrictedText',
    label: 'Restricted text',
    type: FieldMetadataType.TEXT,
    isNullable: true,
    objectMetadataId,
    universalIdentifier: 'restricted-field-universal-id',
  } as FlatFieldMetadata;

  const flatObjectMetadata = {
    id: objectMetadataId,
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    fieldIds: [visibleFieldId, restrictedFieldId],
    universalIdentifier: objectMetadataUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier: null,
    imageIdentifierFieldMetadataUniversalIdentifier: null,
  } as unknown as FlatObjectMetadata;

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {
      [objectMetadataUniversalIdentifier]: flatObjectMetadata,
    },
    universalIdentifierById: {
      [objectMetadataId]: objectMetadataUniversalIdentifier,
    },
    universalIdentifiersByApplicationId: {},
  } as unknown as FlatEntityMaps<FlatObjectMetadata>;

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {
      [visibleField.universalIdentifier]: visibleField,
      [restrictedField.universalIdentifier]: restrictedField,
    },
    universalIdentifierById: {
      [visibleFieldId]: visibleField.universalIdentifier,
      [restrictedFieldId]: restrictedField.universalIdentifier,
    },
    universalIdentifiersByApplicationId: {},
  } as unknown as FlatEntityMaps<FlatFieldMetadata>;

  const objectsPermissions: ObjectsPermissions = {
    [objectMetadataId]: {
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {
        [restrictedFieldId]: { canRead: false, canUpdate: null },
      },
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
  };

  const createService = ({
    viewFilters = [],
    anyFieldFilterValue = null,
  }: {
    viewFilters?: ViewFilterEntity[];
    anyFieldFilterValue?: string | null;
  }) => {
    const viewFilterService = {
      findByViewId: jest.fn().mockResolvedValue(viewFilters),
    };
    const viewFilterGroupService = {
      findByViewId: jest.fn().mockResolvedValue([]),
    };
    const viewService = {
      findById: jest.fn().mockResolvedValue({ anyFieldFilterValue }),
    };

    const service = new CommonGroupByQueryRunnerService(
      viewFilterService as unknown as ViewFilterService,
      viewFilterGroupService as unknown as ViewFilterGroupService,
      viewService as unknown as ViewService,
      {} as GroupByWithRecordsService,
    );

    Object.defineProperty(service, 'filterArgProcessor', {
      value: new FilterArgProcessorService(),
    });

    return service;
  };

  const applyViewFilters = async (service: CommonGroupByQueryRunnerService) => {
    const applyFilterToBuilder = jest.fn();
    const commonQueryParser = {
      applyFilterToBuilder,
      applyDeletedAtToBuilder: jest.fn(),
    } as unknown as GraphqlQueryParser;

    await service['addFiltersToQueryBuilder']({
      args: { viewId: 'view-id' } as GroupByQueryArgs,
      appliedFilters: {},
      queryBuilder: {} as WorkspaceSelectQueryBuilder<ObjectLiteral>,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectsPermissions,
      workspaceId: 'workspace-id',
      commonQueryParser,
    });

    return applyFilterToBuilder.mock.calls[0][2];
  };

  it('excludes unreadable fields from a persisted any-field filter', async () => {
    const service = createService({ anyFieldFilterValue: 'needle' });

    const appliedFilter = await applyViewFilters(service);
    const serializedFilter = JSON.stringify(appliedFilter);

    expect(serializedFilter).toContain('visibleText');
    expect(serializedFilter).not.toContain('restrictedText');
  });

  it('rejects a persisted view filter on an unreadable field', async () => {
    const service = createService({
      viewFilters: [
        {
          id: 'view-filter-id',
          fieldMetadataId: restrictedFieldId,
          value: 'needle',
          operand: ViewFilterOperand.CONTAINS,
          viewFilterGroupId: null,
          positionInViewFilterGroup: null,
          subFieldName: null,
          relationTargetFieldMetadataId: null,
          view: { anyFieldFilterValue: null },
        } as ViewFilterEntity,
      ],
    });

    await expect(applyViewFilters(service)).rejects.toThrow(
      PermissionsException,
    );
  });
});
