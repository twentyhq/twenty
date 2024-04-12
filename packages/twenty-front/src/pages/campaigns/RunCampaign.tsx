import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { useMutation, useQuery } from '@apollo/client';
import { Button } from '@/ui/input/button/components/Button';
import { GET_CAMPAIGN_LISTS } from '@/users/graphql/queries/getCampaignList';
import { UPDATE_CAMPAIGNLIST_STATUS } from '@/users/graphql/queries/updateCampaignlistStatus';
import { UPDATE_LAST_EXECUTION_ID } from '@/users/graphql/queries/updateLastExecutionId';
import { FILTER_LEADS } from '@/users/graphql/queries/filterLeads';
import { useLazyQuery } from '@apollo/client';

import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from 'react';
import { IconCalendar, IconUsersGroup } from '@tabler/icons-react';
import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { Section } from '@react-email/components';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import {
  Checkbox,
  CheckboxShape,
  CheckboxSize,
  CheckboxVariant,
} from '@/ui/input/components/Checkbox';
import DateTimePicker from '@/ui/input/components/internal/date/components/DateTimePicker';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';
import { capitalize } from '~/utils/string/capitalize';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: scroll;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledButton = styled.span`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledTimerHeader = styled.span`
  display: flex;
  gap: 15px;
  width: 100%;
  margin-right: ${({ theme }) => theme.spacing(4)};
  margin-left: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing(2)};
`;

const SytledHR = styled.hr`
  background: ${GRAY_SCALE.gray0};
  color: ${GRAY_SCALE.gray0};
  bordercolor: ${GRAY_SCALE.gray0};
  height: 0.2px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(10)};
`;

const StyledBoardContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: flex-start;
  background: ${({ theme }) => theme.background.noisy};
  padding: ${({ theme }) => theme.spacing(2)};
  overflow-y: scroll;
`;

const StyledTitleBar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(10)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledLabel = styled.span`
  align-items: center;
  box-shadow: none;
  color: ${GRAY_SCALE.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  align-items: center;
`;

const StyledInputCard = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  height: auto%;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const StyledCampaignInfoCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  width: 90%;
`;

const StyledTitleTextContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitleText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  min-width: 150px;

  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  height: 10px;
`;

const StyledTableRow = styled.tr`
  background-color: ${({ theme }) => theme.background.primary};
  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    cursor: pointer;
  }
`;

const StyledTableCell = styled.td`
  padding: 5px;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 25px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledTableHeaderCell = styled.td`
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 25px;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export const RunCampaign = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>();
  const [showStartDateTimePicker, setShowStartDateTimePicker] = useState(false);
  const [showStopDateTimePicker, setShowStopDateTimePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [stopDate, setStopDate] = useState<Date | null>(null);
  const [leadsData, setLeadsData] = useState<any | any[]>([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0);
  const [updateCampaignListStatus] = useMutation(UPDATE_CAMPAIGNLIST_STATUS);
  const [updateExecutionID] = useMutation(UPDATE_LAST_EXECUTION_ID);
  const [queryTimeStamp, setQueryTimeStamp] = useState<Date | null>(null);
  const [masterCheckboxChecked, setMasterCheckboxChecked] = useState(true);

  const fields = [
    'name',
    'age',
    'location',
    'advertisementSource',
    'advertisementName',
    'campaignName',
    'comments',
    'createdAt',
  ];

  //   const [selectedLeads, setSelectedLeads] = useState<any[]>([]);

  const handleRowClick = (rowData: any) => {
    console.log('Clicked on campaign with ID:', rowData);
    setModalOpen(true);
    setSelectedRowData(rowData);
    setLeadsData([]);
  };

  const { loading, error, data } = useQuery(GET_CAMPAIGN_LISTS, {
    variables: {
      filter: {},
      orderBy: { position: 'AscNullsFirst' },
      lastCursor: null,
      limit: null,
    },
  });

  let [filterleads, { data: filterLeadsData }] = useLazyQuery(FILTER_LEADS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setLeadsData(data);
    },
  });
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [unSelectedRows, setunSelectedRows] = useState<{
    [key: string]: boolean;
  }>({});

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
    setLeadsData([]);
    console.log(leadsData.length, '---777777777777777');
    filterLeadsData = [];
  };

  useEffect(() => {
    if (filterLeadsData?.leads?.edges) {
      const initialSelectedRows: { [key: string]: boolean } = {};
      filterLeadsData.leads.edges.forEach((leadEdge: any) => {
        const lead = leadEdge?.node;
        initialSelectedRows[lead.id] = true;
      });
      setSelectedRows(initialSelectedRows);
    }
  }, [filterLeadsData]);

  const handleDisplayLeads = async () => {
    try {
      const segmentFilters = JSON.parse(selectedRowData?.segment?.filters);
      const response = await filterleads({ variables: segmentFilters });
      const leadsCount = response.data?.leads?.totalCount || 0;
      setTotalLeadsCount(leadsCount);
      console.log('Data from the filters fetched:', response.data);
      setQueryTimeStamp(new Date());
      console.log('Timestamp: ', queryTimeStamp?.toString());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUnselectedRowChange = (leadId: string) => {
    setunSelectedRows((prevUnSelectedRows) => ({
      ...prevUnSelectedRows,
      [leadId]: true,
    }));
  };

  const handleCheckboxChange = (leadId: string) => {
    const updatedSelectedRows = { ...selectedRows };
    const updatedUnSelectedRows = { ...unSelectedRows };

    updatedSelectedRows[leadId] = !updatedSelectedRows[leadId];

    if (updatedUnSelectedRows[leadId]) {
      delete updatedUnSelectedRows[leadId];
    }

    setSelectedRows(updatedSelectedRows);
    setunSelectedRows(updatedUnSelectedRows);

    setMasterCheckboxChecked(
      Object.keys(updatedSelectedRows).length ===
        leadsData?.leads?.edges.length,
    );
  };

  const handleRunCampaign = async () => {
    try {
      const campaignExecutionID = `${selectedRowData?.id}-${new Date().toISOString()}`;

      const selectedLeadIds = Object.keys(selectedRows).filter(
        (leadId) => selectedRows[leadId],
      );
      const unSelectedLeadIds = Object.keys(unSelectedRows).filter(
        (leadId) => unSelectedRows[leadId],
      );

      let idsToSend: any[] = [];
      let idType: 'selected' | 'unselected';

      if (selectedLeadIds.length < unSelectedLeadIds.length) {
        idType = 'selected';
        idsToSend = selectedLeadIds.map((leadId) => ({ id: leadId }));
      } else {
        idType = 'unselected';
        idsToSend = unSelectedLeadIds.map((leadId) => ({ id: leadId }));
      }

      let startDateToSend: string | undefined;
      let stopDateToSend: string | undefined;

      if (startDate) {
        startDateToSend = startDate.toISOString();
      } else {
        startDateToSend = new Date().toISOString();
      }

      if (stopDate) {
        stopDateToSend = stopDate.toISOString();
      } else {
        stopDateToSend = new Date().toISOString();
      }

      const requestBody = {
        campaignId: selectedRowData?.id,
        QueryTimestamp: queryTimeStamp,
        id: {
          [idType]: idsToSend,
        },
        campaignExecutionId: campaignExecutionID,
        startDate: startDateToSend,
        stopDate: stopDateToSend,
      };

      console.log('Request Body:', requestBody);

      // Now you can send the requestBody to your endpoint
      // const response = await fetch('someEndpointURL', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(requestBody),
      // });
      // const data = await response.json();

      // console.log('Response from the API:', data);
      const { data: updateData } = await updateCampaignListStatus({
        variables: {
          idToUpdate: selectedRowData?.id,
          input: {
            status: 'ACTIVE',
          },
        },
      });

      const { data: updateExecutionid } = await updateExecutionID({
        variables: {
          idToUpdate: selectedRowData?.id,
          input: {
            lastExecutionId: campaignExecutionID,
          },
        },
      });
      console.log('Response from UPDATE_CAMPAIGN_STATUS:', updateData);
      console.log('Response from UPDATE_LAST_EXECUTION_ID:', updateExecutionid);
    } catch (error) {
      console.log('Error in triggering campaign', error);
    }
  };

  const handleMasterCheckboxChange = () => {
    const updatedSelectedRows: { [key: string]: boolean } = {};
    if (!masterCheckboxChecked) {
      leadsData?.leads?.edges.forEach((leadEdge: any) => {
        const lead = leadEdge?.node;
        updatedSelectedRows[lead.id] = true;
      });
    }
    setSelectedRows(updatedSelectedRows);
    setMasterCheckboxChecked(!masterCheckboxChecked);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <PageContainer>
        <PageHeader title="Trigger Campaign" Icon={IconUsersGroup}></PageHeader>
        <StyledBoardContainer>
          <StyledInputCard>
            <StyledTable>
              <tbody>
                <StyledTableRow>
                  {[
                    'name',
                    'campaignName',
                    'description',
                    'specialtyType',
                    'subSpecialtyType',
                    'leads',
                    'messagingMedia',
                    'startDate',
                    'endDate',
                    'createdAt',
                  ].map((header) =>
                    data.campaignLists.edges[0].node &&
                    Object.keys(data.campaignLists.edges[0].node).includes(
                      header,
                    ) ? (
                      <StyledTableHeaderCell key={header}>
                        {header}
                      </StyledTableHeaderCell>
                    ) : null,
                  )}
                </StyledTableRow>
                {data.campaignLists.edges.map(
                  (edge: {
                    node: {
                      [x: string]:
                        | string
                        | number
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | null
                        | undefined;
                      id?: any;
                    };
                  }) => (
                    <StyledTableRow
                      key={edge.node.id}
                      onClick={() => handleRowClick(edge.node)}
                    >
                      {Object.keys(edge.node)
                        .filter(
                          (key) =>
                            key == 'name' ||
                            key == 'campaignName' ||
                            key == 'description' ||
                            key == 'specialtyType' ||
                            key == 'subSpecialtyType' ||
                            key == 'leads' ||
                            key == 'messagingMedia' ||
                            key == 'startDate' ||
                            key == 'endDate' ||
                            key == 'createdAt',
                        )
                        .map((header) => (
                          <StyledTableHeaderCell key={header}>
                            {edge.node[header]}
                          </StyledTableHeaderCell>
                        ))}
                    </StyledTableRow>
                  ),
                )}
              </tbody>
            </StyledTable>
          </StyledInputCard>
        </StyledBoardContainer>
      </PageContainer>

      <ModalWrapper isOpen={modalOpen} onClose={handleCloseModal}>
        <StyledInputCard>
          <StyledInputCard>
            <StyledTitleBar>
              <StyledTitle>Run Campaign</StyledTitle>
            </StyledTitleBar>
            <StyledCampaignInfoCard>
              <StyledTitleTextContainer>
                <StyledTitleText>Campaign Name:</StyledTitleText>
                <StyledText>{selectedRowData?.name}</StyledText>
              </StyledTitleTextContainer>
              <StyledTitleTextContainer>
                <StyledTitleText>Segment Name:</StyledTitleText>
                <StyledText>{selectedRowData?.campaignName}</StyledText>
              </StyledTitleTextContainer>
              <StyledTitleTextContainer>
                <StyledTitleText>Description:</StyledTitleText>
                <StyledText>{selectedRowData?.description}</StyledText>
              </StyledTitleTextContainer>
              <StyledTitleTextContainer>
                <StyledTitleText>Specialty:</StyledTitleText>
                <StyledText>{selectedRowData?.specialtyType}</StyledText>
              </StyledTitleTextContainer>
              <StyledTitleTextContainer>
                <StyledTitleText>Sub Specialty:</StyledTitleText>
                <StyledText>{selectedRowData?.subSpecialtyType}</StyledText>
              </StyledTitleTextContainer>
              <StyledTitleTextContainer>
                <StyledTitleText>Message Template:</StyledTitleText>
                <StyledText>{selectedRowData?.messagingMedia}</StyledText>
              </StyledTitleTextContainer>
            </StyledCampaignInfoCard>

            <SytledHR />
            <StyledTimerHeader>
              <StyledTimerHeader>
                <H2Title title="Start" />
              </StyledTimerHeader>

              <Section>
                <StyledCheckboxContainer>
                  <Checkbox
                    checked={false}
                    indeterminate={false}
                    variant={CheckboxVariant.Primary}
                    size={CheckboxSize.Small}
                    shape={CheckboxShape.Squared}
                  />
                  <StyledLabel>Immediately</StyledLabel>
                </StyledCheckboxContainer>
                <StyledCheckboxContainer>
                  <Checkbox
                    checked={showStartDateTimePicker}
                    onChange={() =>
                      setShowStartDateTimePicker(!showStartDateTimePicker)
                    }
                    indeterminate={false}
                    variant={CheckboxVariant.Primary}
                    size={CheckboxSize.Small}
                    shape={CheckboxShape.Squared}
                  />
                  <StyledLabel>
                    Start Date/Time <IconCalendar />
                  </StyledLabel>
                  {showStartDateTimePicker && (
                    <DateTimePicker
                      onChange={(selectedDate) => setStartDate(selectedDate)}
                      minDate={new Date()}
                      value={undefined}
                    />
                  )}
                </StyledCheckboxContainer>
              </Section>
            </StyledTimerHeader>
            <SytledHR />
            <StyledTimerHeader>
              <StyledTimerHeader>
                <H2Title title="Stop" />
              </StyledTimerHeader>

              <Section>
                <StyledCheckboxContainer>
                  <Checkbox
                    checked={false}
                    indeterminate={false}
                    variant={CheckboxVariant.Primary}
                    size={CheckboxSize.Small}
                    shape={CheckboxShape.Squared}
                  />
                  <StyledLabel>Immediately</StyledLabel>
                </StyledCheckboxContainer>
                <StyledCheckboxContainer>
                  <Checkbox
                    checked={showStopDateTimePicker}
                    onChange={() =>
                      setShowStopDateTimePicker(!showStopDateTimePicker)
                    }
                    indeterminate={false}
                    variant={CheckboxVariant.Primary}
                    size={CheckboxSize.Small}
                    shape={CheckboxShape.Squared}
                  />
                  <StyledLabel>
                    Start Date/Time <IconCalendar />
                  </StyledLabel>
                  {showStopDateTimePicker && (
                    <DateTimePicker
                      onChange={(selectedDate) => setStopDate(selectedDate)}
                      minDate={new Date()}
                      value={undefined}
                    />
                  )}
                </StyledCheckboxContainer>
              </Section>
            </StyledTimerHeader>
          </StyledInputCard>
          <SytledHR />
          <StyledButton>
            <Button
              title="Display Segment Leads"
              variant="primary"
              accent="default"
              onClick={handleDisplayLeads}
            />
            <Button
              title="Run Campaign"
              variant="primary"
              accent="dark"
              onClick={handleRunCampaign}
            />
          </StyledButton>
          <StyledInputCard>
            {leadsData?.leads?.edges[0] && (
              <StyledTable>
                <StyledTitleTextContainer>
                  <StyledTitleText>
                    Total Leads: {totalLeadsCount}
                  </StyledTitleText>
                  <StyledTitleText>
                    Selected Leads: {Object.keys(selectedRows).length}
                  </StyledTitleText>
                  <StyledTitleText>
                    Unselected Leads: {Object.keys(unSelectedRows).length}
                  </StyledTitleText>
                </StyledTitleTextContainer>

                <tbody>
                  <StyledTableRow>
                    <StyledTableHeaderCell>
                      <StyledComboInputContainer>
                        <Checkbox
                          checked={masterCheckboxChecked}
                          onChange={handleMasterCheckboxChange}
                        />
                        Select
                      </StyledComboInputContainer>
                    </StyledTableHeaderCell>
                    {fields.map((field: string) => (
                      <StyledTableHeaderCell key={field}>
                        {capitalize(field)}
                      </StyledTableHeaderCell>
                    ))}
                  </StyledTableRow>
                  {leadsData?.leads?.edges.map((leadEdge: any) => {
                    const lead = leadEdge?.node;
                    return (
                      <StyledTableRow
                        key={lead.id}
                        onClick={() => handleCheckboxChange(lead.id)}
                      >
                        <StyledTableCell>
                          <Checkbox
                            checked={selectedRows[lead.id]}
                            onChange={() => handleCheckboxChange(lead.id)}
                          />
                        </StyledTableCell>
                        {fields.map((field: string) => (
                          <StyledTableCell key={field}>
                            {lead[field]}
                          </StyledTableCell>
                        ))}
                      </StyledTableRow>
                    );
                  })}
                </tbody>
              </StyledTable>
            )}
          </StyledInputCard>
        </StyledInputCard>
      </ModalWrapper>
    </>
  );
};
