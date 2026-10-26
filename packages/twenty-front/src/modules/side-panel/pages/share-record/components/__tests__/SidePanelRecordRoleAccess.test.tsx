import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { SidePanelRecordRoleAccess } from '@/side-panel/pages/share-record/components/SidePanelRecordRoleAccess';

const roles = [
  {
    id: 'sales',
    label: 'Sales',
    canRead: true,
    canUpdate: false,
    hasSomeReadAccess: true,
    hasSomeUpdateAccess: true,
  },
  {
    id: 'support',
    label: 'Support',
    canRead: false,
    canUpdate: false,
    hasSomeReadAccess: true,
    hasSomeUpdateAccess: false,
  },
  {
    id: 'admin',
    label: 'Admin',
    canRead: true,
    canUpdate: true,
    hasSomeReadAccess: true,
    hasSomeUpdateAccess: true,
  },
  {
    id: 'private',
    label: 'Private role',
    canRead: false,
    canUpdate: false,
    hasSomeReadAccess: false,
    hasSomeUpdateAccess: false,
  },
];

describe('Role access in the sharing panel', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  it('distinguishes shared role access from member-specific conditional access', () => {
    render(
      <I18nProvider i18n={i18n}>
        <SidePanelRecordRoleAccess roles={roles} search="" />
      </I18nProvider>,
    );
    expect(screen.getByText('Through roles')).toBeInTheDocument();
    expect(screen.getByText('Some can edit')).toBeInTheDocument();
    expect(screen.getByText('Some can view')).toBeInTheDocument();
    expect(screen.getByText('Can edit')).toBeInTheDocument();
    expect(screen.queryByText('Private role')).not.toBeInTheDocument();
    expect(screen.getByText('Access can vary by member.')).toBeInTheDocument();
  });

  it('filters role labels without displaying roles that have no access', () => {
    const { rerender } = render(
      <I18nProvider i18n={i18n}>
        <SidePanelRecordRoleAccess roles={roles} search="SUP" />
      </I18nProvider>,
    );
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.queryByText('Sales')).not.toBeInTheDocument();
    rerender(
      <I18nProvider i18n={i18n}>
        <SidePanelRecordRoleAccess roles={roles} search="Private" />
      </I18nProvider>,
    );
    expect(screen.queryByText('Through roles')).not.toBeInTheDocument();
  });
});
