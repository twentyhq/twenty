import React from 'react';

import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { HooksEntityTable } from '@/ui/table/components/HooksEntityTable';
import { TableContext } from '@/ui/table/states/TableContext';
import { companiesFilters } from '~/pages/companies/companies-filters';

import { ComponentStorybookLayout } from './ComponentStorybookLayout';

export function getRenderWrapperForEntityTableComponent(
  children: React.ReactElement,
) {
  return function Render() {
    return (
      <RecoilScope SpecificContext={TableContext}>
        {/*
        TODO: add company mocked loader
        <CompanyEntityTableData */}
        <HooksEntityTable
          availableFilters={companiesFilters}
          numberOfColumns={5}
        />
        <ComponentStorybookLayout>{children}</ComponentStorybookLayout>
      </RecoilScope>
    );
  };
}
