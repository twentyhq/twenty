import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';

import { HooksCompanyBoard } from '@/companies/components/HooksCompanyBoard';
import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { BoardActionBarButtonDeleteBoardCard } from '@/pipeline/components/BoardActionBarButtonDeletePipelineProgress';
import { EntityBoard } from '@/pipeline/components/EntityBoard';
import { EntityBoardActionBar } from '@/pipeline/components/EntityBoardActionBar';
import {
  defaultPipelineProgressOrderBy,
  PipelineProgressesSelectedSortType,
} from '@/pipeline/queries';
import { reduceSortsToOrderBy } from '@/ui/filter-n-sort/helpers';
import { IconTargetArrow } from '@/ui/icon/index';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { PipelineProgressOrderByWithRelationInput } from '~/generated/graphql';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

export function Opportunities() {
  const theme = useTheme();

  const [orderBy, setOrderBy] = useState<
    PipelineProgressOrderByWithRelationInput[]
  >(defaultPipelineProgressOrderBy);

  const updateSorts = useCallback(
    (sorts: Array<PipelineProgressesSelectedSortType>) => {
      setOrderBy(
        sorts.length
          ? reduceSortsToOrderBy(sorts)
          : defaultPipelineProgressOrderBy,
      );
    },
    [],
  );

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      <RecoilScope SpecificContext={CompanyBoardContext}>
        <HooksCompanyBoard
          availableFilters={opportunitiesBoardOptions.filters}
          orderBy={orderBy}
        />
        <EntityBoard
          boardOptions={opportunitiesBoardOptions}
          updateSorts={updateSorts}
        />
        <EntityBoardActionBar>
          <BoardActionBarButtonDeleteBoardCard />
        </EntityBoardActionBar>
      </RecoilScope>
    </WithTopBarContainer>
  );
}
