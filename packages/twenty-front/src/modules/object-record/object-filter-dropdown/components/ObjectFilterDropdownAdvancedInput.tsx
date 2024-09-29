/* eslint-disable react/jsx-props-no-spreading */
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { computeAdvancedViewFilterValue } from '@/views/utils/view-filter-value/computeAdvancedViewFilterValue';
import { resolveFilterValue } from '@/views/utils/view-filter-value/resolveFilterValue';
import {
  BasicConfig,
  Builder,
  BuilderProps,
  Config,
  ImmutableTree,
  Query,
  Utils,
} from '@react-awesome-query-builder/ui';
import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

export const queryBuilderConfig: Config = {
  ...BasicConfig,
  fields: {
    qty: {
      label: 'Qty',
      type: 'number',
      fieldSettings: {
        min: 0,
      },
      valueSources: ['value'],
      preferWidgets: ['number'],
    },
    price: {
      label: 'Price',
      type: 'number',
      valueSources: ['value'],
      fieldSettings: {
        min: 10,
        max: 100,
      },
      preferWidgets: ['slider', 'rangeslider'],
    },
    name: {
      label: 'Name',
      type: 'text',
    },
    color: {
      label: 'Color',
      type: 'select',
      valueSources: ['value'],
      fieldSettings: {
        listValues: [
          { value: 'yellow', title: 'Yellow' },
          { value: 'green', title: 'Green' },
          { value: 'orange', title: 'Orange' },
        ],
      },
    },
    is_promotion: {
      label: 'Promo?',
      type: 'boolean',
      operators: ['equal'],
      valueSources: ['value'],
    },
  },
};

export const ObjectFilterDropdownAdvancedInput = () => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedFilterState,
    setIsObjectFilterDropdownUnfolded,
    selectFilter,
  } = useFilterDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState) as
    | (Filter & { definition: { type: 'ADVANCED' } })
    | null
    | undefined;

  const onChange = useCallback(
    (immutableTree: ImmutableTree, config: Config) => {
      if (!filterDefinitionUsedInDropdown) return;

      selectFilter?.({
        id: selectedFilter?.id ? selectedFilter.id : v4(),
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: computeAdvancedViewFilterValue(immutableTree),
        operand: ViewFilterOperand.Is,
        displayValue: '',
        definition: filterDefinitionUsedInDropdown,
      });

      setIsObjectFilterDropdownUnfolded(false);
    },
    [],
  );

  const tree = selectedFilter && resolveFilterValue(selectedFilter);

  const renderBuilder = useCallback(
    (props: BuilderProps) => (
      <div className="query-builder-container" style={{ padding: '10px' }}>
        <div className="query-builder qb-lite">
          <Builder {...props} />
        </div>
      </div>
    ),
    [],
  );

  if (!tree) {
    return <div>TODO: No tree</div>;
  }

  return (
    <div>
      <Query
        {...queryBuilderConfig}
        value={tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
      <div className="query-builder-result">
        <div>
          Query string:{' '}
          <pre>
            {JSON.stringify(Utils.queryString(tree, queryBuilderConfig))}
          </pre>
        </div>
        <div>
          JsonLogic:{' '}
          <pre>
            {JSON.stringify(Utils.jsonLogicFormat(tree, queryBuilderConfig))}
          </pre>
        </div>
      </div>
    </div>
  );
};
