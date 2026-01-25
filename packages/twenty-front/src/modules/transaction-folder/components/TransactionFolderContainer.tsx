import styled from '@emotion/styled';

import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

import {
    IconCheckbox,
    IconCurrencyDollar,
    IconFolder,
    IconHome,
    IconShield,
    IconTimeline,
} from 'twenty-ui/display';
import { TransactionChecklistTab } from './tabs/TransactionChecklistTab';
import { TransactionComplianceTab } from './tabs/TransactionComplianceTab';
import { TransactionFilesTab } from './tabs/TransactionFilesTab';
import { TransactionFinanceTab } from './tabs/TransactionFinanceTab';
import { TransactionOverviewTab } from './tabs/TransactionOverviewTab';
import { TransactionTimelineTab } from './tabs/TransactionTimelineTab';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledPropertyAddress = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledTabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

type TransactionFolderContainerProps = {
  transactionId: string;
  transactionName?: string;
  propertyAddress?: string;
};

export const TransactionFolderContainer = ({
  transactionId,
  transactionName = 'Transaction',
  propertyAddress = '',
}: TransactionFolderContainerProps) => {
  const componentInstanceId = `transaction-folder-${transactionId}`;

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const tabs = [
    {
      id: 'overview',
      title: 'Overview',
      Icon: IconHome,
    },
    {
      id: 'files',
      title: 'Files',
      Icon: IconFolder,
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimeline,
    },
    {
      id: 'checklist',
      title: 'Checklist',
      Icon: IconCheckbox,
    },
    {
      id: 'compliance',
      title: 'Compliance',
      Icon: IconShield,
    },
    {
      id: 'finance',
      title: 'Finance',
      Icon: IconCurrencyDollar,
    },
  ];

  const renderActiveTab = () => {
    switch (activeTabId) {
      case 'overview':
        return <TransactionOverviewTab transactionId={transactionId} />;
      case 'files':
        return <TransactionFilesTab transactionId={transactionId} />;
      case 'timeline':
        return <TransactionTimelineTab transactionId={transactionId} />;
      case 'checklist':
        return <TransactionChecklistTab transactionId={transactionId} />;
      case 'compliance':
        return <TransactionComplianceTab transactionId={transactionId} />;
      case 'finance':
        return <TransactionFinanceTab transactionId={transactionId} />;
      default:
        return <TransactionOverviewTab transactionId={transactionId} />;
    }
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>{transactionName}</StyledTitle>
        {propertyAddress && (
          <StyledPropertyAddress>{propertyAddress}</StyledPropertyAddress>
        )}
      </StyledHeader>

      <TabList
        tabs={tabs}
        componentInstanceId={componentInstanceId}
        behaveAsLinks={false}
        loading={false}
      />

      <StyledTabContent>{renderActiveTab()}</StyledTabContent>
    </StyledContainer>
  );
};
