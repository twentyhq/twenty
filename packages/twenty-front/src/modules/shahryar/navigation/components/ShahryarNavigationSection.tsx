import { SHAHRYAR_APP_PATHS } from '@/shahryar/constants/shahryar-routes';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useLocation } from 'react-router-dom';
import {
  IconCalendarX,
  IconChartBar,
  IconClock,
  IconCurrencyDollar,
  IconDatabaseExport,
  IconHome,
  IconMap,
  IconPhone,
  IconShield,
  IconUserCog,
  IconUserPin,
} from 'twenty-ui/display';

const SHAHRYAR_NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: SHAHRYAR_APP_PATHS.Dashboard,
    Icon: IconHome,
  },
  {
    label: 'مارکێت و وەکیلەکان',
    path: SHAHRYAR_APP_PATHS.Markets,
    Icon: IconMap,
  },
  {
    label: 'سەردانی موشریف',
    path: SHAHRYAR_APP_PATHS.SupervisorVisits,
    Icon: IconUserPin,
  },
  {
    label: 'کاتی کارکردن',
    path: SHAHRYAR_APP_PATHS.WorkingTimes,
    Icon: IconClock,
  },
  {
    label: 'ڕاپۆرتەکان',
    path: SHAHRYAR_APP_PATHS.Reports,
    Icon: IconChartBar,
  },
  {
    label: 'تەدمین',
    path: SHAHRYAR_APP_PATHS.Admin,
    Icon: IconUserCog,
  },
  {
    label: 'مۆبایل ئەپ',
    path: SHAHRYAR_APP_PATHS.MobileApp,
    Icon: IconPhone,
  },
  {
    label: 'بەشی پارەدان',
    path: SHAHRYAR_APP_PATHS.Payments,
    Icon: IconCurrencyDollar,
  },
  {
    label: 'غرامەی موشریفەکان',
    path: SHAHRYAR_APP_PATHS.SupervisorPenalties,
    Icon: IconShield,
  },
  {
    label: 'غیابات',
    path: SHAHRYAR_APP_PATHS.Absences,
    Icon: IconCalendarX,
  },
  {
    label: 'باک ئەپ',
    path: SHAHRYAR_APP_PATHS.Backups,
    Icon: IconDatabaseExport,
  },
] as const;

export const ShahryarNavigationSection = () => {
  const location = useLocation();

  return (
    <NavigationDrawerSection>
      <NavigationDrawerSectionTitle label="Shahryar OPS" />
      {SHAHRYAR_NAV_ITEMS.map((item) => (
        <NavigationDrawerItem
          key={item.path}
          label={item.label}
          Icon={item.Icon}
          to={item.path}
          active={location.pathname === item.path}
        />
      ))}
    </NavigationDrawerSection>
  );
};
