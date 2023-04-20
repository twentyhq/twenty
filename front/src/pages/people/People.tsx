import { faUser, faList } from '@fortawesome/pro-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import styled from '@emotion/styled';
import { peopleColumns } from './people-table';
import { defaultData } from './defaultData';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

function People() {
  return (
    <WithTopBarContainer title="People" icon={faUser}>
      <StyledPeopleContainer>
        <Table
          data={defaultData}
          columns={peopleColumns}
          viewName="All People"
          viewIcon={faList}
        />
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
