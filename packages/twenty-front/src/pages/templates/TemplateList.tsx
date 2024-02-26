import { useNavigate } from 'react-router-dom';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';

export const TemplateList = () => {
  const navigate = useNavigate();

  const handleRowClick = (templateName: string) => {
    navigate(`/${templateName.toLowerCase()}`);
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <H2Title
          title="Templates"
          description={`List of all the WhatsApp Templates.`}
        />
        <Table>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Created At</TableHeader>
          </TableRow>

          <TableRow onClick={() => handleRowClick('TextTemplate')}>
            <TableCell>Text Template</TableCell>
            <TableCell>Template with text Header type.</TableCell>
            <TableCell>12/12/12</TableCell>
          </TableRow>

          <TableRow onClick={() => handleRowClick('ImageTemplate')}>
            <TableCell>Image Template</TableCell>
            <TableCell>Template with Image Header type.</TableCell>
            <TableCell>12/12/12</TableCell>
          </TableRow>

          <TableRow onClick={() => handleRowClick('VideoTemplate')}>
            <TableCell>Video Template</TableCell>
            <TableCell>Template with Video Header type.</TableCell>
            <TableCell>12/12/12</TableCell>
          </TableRow>

          <TableRow onClick={() => handleRowClick('AudioTemplate')}>
            <TableCell>Audio Template</TableCell>
            <TableCell>Template with Audio Header type.</TableCell>
            <TableCell>12/12/12</TableCell>
          </TableRow>

          <TableRow onClick={() => handleRowClick('DocumentTemplate')}>
            <TableCell>Document Template</TableCell>
            <TableCell>Template with Video Header type.</TableCell>
            <TableCell>12/12/12</TableCell>
          </TableRow>
        </Table>
      </SettingsPageContainer>
      {/* <Button
        Icon={IconPlus}
        title="Add Template"
        size="small"
        variant="secondary"
      /> */}
    </SubMenuTopBarContainer>
  );
};
