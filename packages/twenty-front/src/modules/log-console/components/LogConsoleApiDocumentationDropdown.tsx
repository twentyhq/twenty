import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconArrowUpRight, IconChevronDown } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { LOG_CONSOLE_API_DOCUMENTATION_SCHEMAS } from '@/log-console/constants/LogConsoleApiDocumentationSchemas';
import { LOG_CONSOLE_API_DOCUMENTATION_TYPES } from '@/log-console/constants/LogConsoleApiDocumentationTypes';
import { useOpenPlayground } from '@/settings/mcp-and-apis/hooks/useOpenPlayground';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const LOG_CONSOLE_API_DOCUMENTATION_DROPDOWN_ID =
  'log-console-api-documentation';

export const LogConsoleApiDocumentationDropdown = () => {
  const { t } = useLingui();
  const openPlayground = useOpenPlayground();

  return (
    <DropdownRoot
      dropdownId={LOG_CONSOLE_API_DOCUMENTATION_DROPDOWN_ID}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <Button variant="outline" size="sm" endIcon={<IconChevronDown />}>
            {t`Documentation`}
          </Button>
        }
      />
      <DropdownContent align="end" aria-label={t`Documentation`}>
        {LOG_CONSOLE_API_DOCUMENTATION_TYPES.map((documentationType) => (
          <Dropdown.Submenu key={documentationType.value}>
            <Dropdown.SubmenuTrigger
              startIcon={<documentationType.Icon />}
              delay={0}
            >
              {t(documentationType.label)}
            </Dropdown.SubmenuTrigger>
            <Dropdown.Content aria-label={t(documentationType.label)}>
              {LOG_CONSOLE_API_DOCUMENTATION_SCHEMAS.map(
                (documentationSchema) => (
                  <Dropdown.ActionItem
                    key={documentationSchema.value}
                    startIcon={<documentationSchema.Icon />}
                    endIcon={<IconArrowUpRight />}
                    onClick={() =>
                      openPlayground(
                        documentationType.value,
                        documentationSchema.value,
                      )
                    }
                  >
                    {t(documentationSchema.label)}
                  </Dropdown.ActionItem>
                ),
              )}
            </Dropdown.Content>
          </Dropdown.Submenu>
        ))}
      </DropdownContent>
    </DropdownRoot>
  );
};
