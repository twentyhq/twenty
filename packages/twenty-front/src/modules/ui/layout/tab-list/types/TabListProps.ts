import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

export type TabListProps = {
  tabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks?: boolean;
  className?: string;
  isInRightDrawer?: boolean;
  componentInstanceId: string;
  onChangeTab?: (tabId: string) => void;
};
