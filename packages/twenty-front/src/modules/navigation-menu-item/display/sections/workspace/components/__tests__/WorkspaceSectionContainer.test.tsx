import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const Wrapper = ({ children }: { children: ReactNode }) => (
  <BaseWrapper>
    <MemoryRouter initialEntries={['/objects/companies']}>
      {children}
    </MemoryRouter>
  </BaseWrapper>
);

describe('WorkspaceSectionContainer', () => {
  it('keeps the section and its right icon reachable when there are no items', () => {
    render(
      <WorkspaceSectionContainer
        sectionTitle="Workspace"
        items={[]}
        rightIcon={<button type="button">Customize</button>}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Customize' }),
    ).toBeInTheDocument();
  });
});
