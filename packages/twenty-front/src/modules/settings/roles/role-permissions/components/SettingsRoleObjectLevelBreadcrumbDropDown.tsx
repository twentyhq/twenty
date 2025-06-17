import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown } from 'twenty-ui/display';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';

export const SettingsRoleObjectLevelBreadcrumbDropDown = () => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const { roleId, objectMetadataId } = useParams();

  const isStep1 = !isDefined(objectMetadataId);

  const STEPS = [
    {
      label: t`1. Object selection`,
      href: `/settings/roles/${roleId}/add-object-permission`,
      isDisabled: isStep1,
    },
    {
      label: t`2. Permissions configuration`,
      href: `/settings/roles/${roleId}/object/${objectMetadataId}`,
      isDisabled: !isStep1,
    },
  ];

  const activeStep = STEPS.find((step) => pathname.includes(step.href));

  return (
    <Dropdown
      dropdownId="new-field-step-dropdown"
      dropdownHotkeyScope={{ scope: 'role-object-level-breadcrumb' }}
      clickableComponent={
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {activeStep?.label} <IconChevronDown />
        </span>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {STEPS.map((step) => (
              <UndecoratedLink to={step.href} key={step.label}>
                <MenuItem
                  key={step.label}
                  text={step.label}
                  disabled={step.isDisabled}
                />
              </UndecoratedLink>
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
