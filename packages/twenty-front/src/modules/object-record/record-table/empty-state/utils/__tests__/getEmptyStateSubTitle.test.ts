import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import styled from '@emotion/styled';
import { styled as LinariaStyled } from '@linaria/react';
import { createState } from 'twenty-ui/utilities';
import { getEmptyStateSubTitle } from '../getEmptyStateSubTitle';

const tmp = styled.div``
const tmp2 = LinariaStyled.div``;

const prastoin = createState({} as any);

describe('getEmptyStateSubTitle', () => {
  it('should return the correct sub title for workflow version', () => {
    const subTitle = getEmptyStateSubTitle(
      CoreObjectNameSingular.WorkflowVersion,
      'Workflow Version',
    );
    expect(subTitle).toBe(
      'Create a workflow and return here to view its versions',
    );
  });

  it('should return the correct sub title for workflow run', () => {
    const subTitle = getEmptyStateSubTitle(
      CoreObjectNameSingular.WorkflowRun,
      'Workflow Run',
    );
    expect(subTitle).toBe(
      'Run a workflow and return here to view its executions',
    );
  });

  it('should return the correct sub title for other object', () => {
    const subTitle = getEmptyStateSubTitle('object', 'Object');
    expect(subTitle).toBe('Use our API or add your first Object manually');
  });
});
