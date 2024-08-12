import { AppPath } from '@/types/AppPath';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { useNavigate } from 'react-router-dom';
import { IconComponent } from 'twenty-ui';

export const WorkflowShowPageHeader = ({
  workflowName,
  headerIcon,
  children,
}: {
  workflowName: string;
  headerIcon: IconComponent;
  children?: React.ReactNode;
}) => {
  const navigate = useNavigate();

  return (
    <PageHeader
      hasClosePageButton
      onClosePage={() => {
        navigate({
          pathname: AppPath.WorkflowIndexPage,
        });
      }}
      title={workflowName}
      Icon={headerIcon}
    >
      {children}
    </PageHeader>
  );
};
