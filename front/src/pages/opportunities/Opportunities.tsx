import { useTheme } from '@emotion/react';

import { companyBoardOptions } from '@/companies/components/companyBoardOptions';
import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { BoardActionBarButtonDeletePipelineProgress } from '@/pipeline-progress/components/BoardActionBarButtonDeletePipelineProgress';
import { EntityBoard } from '@/pipeline-progress/components/EntityBoard';
import { EntityBoardActionBar } from '@/pipeline-progress/components/EntityBoardActionBar';
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
        <EntityBoard boardOptions={companyBoardOptions} />
        <EntityBoardActionBar>
          <BoardActionBarButtonDeletePipelineProgress />
        </EntityBoardActionBar>
      </RecoilScope>
    </WithTopBarContainer>
  );
}
