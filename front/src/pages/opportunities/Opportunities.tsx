import { useTheme } from '@emotion/react';

import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { BoardActionBarButtonDeletePipelineProgress } from '@/pipeline-progress/components/BoardActionBarButtonDeletePipelineProgress';
import { companyBoardOptions } from '@/pipeline-progress/components/companyBoardOptions';
import { EntityBoardActionBar } from '@/pipeline-progress/components/EntityBoardActionBar';
import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import { HookCompanyBoard } from './HookCompanyBoard';

export function Opportunities() {
  const theme = useTheme();

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      <HookCompanyBoard />
      <RecoilScope SpecificContext={CompanyBoardContext}>
        <EntityProgressBoard boardOptions={companyBoardOptions} />
        <EntityBoardActionBar>
          <BoardActionBarButtonDeletePipelineProgress />
        </EntityBoardActionBar>
      </RecoilScope>
    </WithTopBarContainer>
  );
}
