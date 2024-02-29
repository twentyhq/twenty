import { Section } from '@/ui/layout/section/components/Section';
import { Checkbox, CheckboxVariant,CheckboxSize, CheckboxShape, Select, TextInput } from 'tsup.ui.index';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { Nullable } from '~/types/Nullable';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { IconMail } from '@/ui/display/icon';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import styled from '@emotion/styled';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { Button } from '@/ui/input/button/components/Button';
import { Radio } from '@/ui/input/components/Radio';
import { SetStateAction, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SPECIALTY } from '@/users/graphql/queries/getSpecialtyDetails';
import DateTimePicker from '../modules/ui/input/components/internal/date/components/DateTimePicker';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledRadio = styled(Radio)`
  margin-right: 16;
`;

const StyledSection = styled(Section)`
margin-bottom: 16px;
margin-left: 0;
display: flex;
justify-content: space-around;
align-items: center;
`;

const SaveButtonContainer = styled.div`
  width: auto;
  display: flex;
  justify-content: flex-end;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const StyledCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
`;


export type SpecilatySelectValues = {
  currencyCode: CurrencyCode;
};

export type DateInputProps = {
  value: Nullable<Date>;
  onEnter: (newDate: Nullable<Date>) => void;
  onEscape: (newDate: Nullable<Date>) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => void;
  hotkeyScope: string;
  clearable?: boolean;
  onChange?: (newDate: Nullable<Date>) => void;
};


export const Campaigns = () => {
  var Specialty:any = [
  ];

  const SpecialtyTypes:any={
  }

  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [specialty, setSpecialty] = useState();
  const [subSpecialty, setSubSpecialty] = useState('');
  const [selectedStartDate,setSelectedStartDate]=useState(new Date())
  const { loading: queryLoading, data: queryData } = useQuery(
    GET_SPECIALTY,
  );

  if(!queryLoading){
    const specialtyTypes=queryData.subSpecialties.edges.map((edge: { node: { specialtyType: { name: any; }; }; })=> edge?.node?.specialtyType?.name);
    const uniqueSpecialtyTypes=Array.from(new Set(specialtyTypes));
    Specialty = uniqueSpecialtyTypes.map(specialtyType => ({
      value: specialtyType,
      label: specialtyType
    }));
    
    queryData.subSpecialties.edges.forEach((edge: { node: { specialtyType: { name: any; }; name: any; }; }) => {
      const specialtyType = edge.node.specialtyType.name;
      const subSpecialty = edge.node.name;
    
      // If the specialty type is already a key in the dictionary, push the sub-specialty to its array
      if (SpecialtyTypes[specialtyType]) {
        SpecialtyTypes[specialtyType].push({value: subSpecialty,label:subSpecialty});
      } else {
        // If the specialty type is not yet a key, create a new array with the sub-specialty as its first element
        SpecialtyTypes[specialtyType] = [];
        SpecialtyTypes[specialtyType].push({value: subSpecialty,label:subSpecialty});

      }
    });
  }
    
  const handleCampaignChange = (e:any) => {
      setCampaignName(e.target.value);
  };

  const handleDescriptionChange = (e:any) => {
      setDescription(e.target.value);
  };

    const handleSpecialtySelectChange = (selectedValue:any) => {
      setSpecialty(selectedValue);
    };
  
    const handleSubSpecialtySelectChange = (selectedValue:any) => {
      setSubSpecialty(selectedValue);
    };

    const [date, setDate] = useState(new Date());    

    const [selectedMessaging, setSelectedMessaging] = useState("");

    const handleRadioChange = (value: string) => {
      setSelectedMessaging(value)
    };


  return (
  <SubMenuTopBarContainer Icon={IconMail} title="Campaign">
    <SettingsPageContainer>
        <StyledH1Title title="Campaign" />
        <Section>
            <TextInput
                    label="Campaign Name"
                    value={campaignName}
                    onChange={()=>handleCampaignChange(event)}
                    placeholder="Campaign Name"
                    name='campaignName'
                    fullWidth
                />
        </Section>
        <Section>
            <TextInput
                    label="Description"
                    value={description}
                    onChange={()=>handleDescriptionChange(event)}
                    placeholder="Description about campaign"
                    name='description'
                    fullWidth
                />
        </Section>
        <Section>
          <Select
            fullWidth
            // disabled
            label="Specialty Type"
            dropdownId="Specialty Type"
            value={specialty}
            options={Specialty}
            onChange={handleSpecialtySelectChange}
          />
        </Section>
        {specialty &&
        <Section>
            <Select
                fullWidth
                // disabled
                label="Sub Specialty Type"
                dropdownId="Sub Specialty Type"
                value={subSpecialty}
                options={SpecialtyTypes[specialty]}
                onChange={handleSubSpecialtySelectChange}
                />
        </Section>}
        <Section>
          <StyledLabel>Start Date</StyledLabel>
          <DateTimePicker onChange={(date)=>setDate(date)} minDate={date} />
        </Section>
        <Section>
          <StyledLabel>End Date</StyledLabel>
          <DateTimePicker onChange={(date)=>setDate(date)}  minDate={date} selected={null}/>
        </Section>

        <StyledLabel>Messaging</StyledLabel>
        <StyledSection>
        <StyledCheckboxLabel htmlFor="sms-checkbox">
          <Checkbox
            // id="sms-checkbox"
            checked={false}
            indeterminate={false}
            onChange={(checked) => handleRadioChange("SMS")}
            variant={CheckboxVariant.Primary}
            size={CheckboxSize.Small}
            shape={CheckboxShape.Squared}
          />
          SMS
          </StyledCheckboxLabel>

          <StyledCheckboxLabel htmlFor="whatsapp-checkbox">
            <Checkbox
              // id="whatsapp-checkbox"
              checked={false}
              indeterminate={false}
              onChange={(checked) => handleRadioChange("WhastApp")}
              variant={CheckboxVariant.Primary}
              size={CheckboxSize.Small}
              shape={CheckboxShape.Squared}
            />
            WhastApp
          </StyledCheckboxLabel>

          <StyledCheckboxLabel htmlFor="gbm-checkbox">
            <Checkbox
              // id="gbm-checkbox"
              checked={false}
              indeterminate={false}
              onChange={(checked) => handleRadioChange("GBM")}
              variant={CheckboxVariant.Primary}
              size={CheckboxSize.Small}
              shape={CheckboxShape.Squared}
            />
            GBM
          </StyledCheckboxLabel>
          
          <StyledCheckboxLabel htmlFor="call-checkbox">
            <Checkbox
              // id="call-checkbox"
              checked={false}
              indeterminate={false}
              onChange={(checked) => handleRadioChange("Call")}
              variant={CheckboxVariant.Primary}
              size={CheckboxSize.Small}
              shape={CheckboxShape.Squared}
            />
            Call
            </StyledCheckboxLabel>
        </StyledSection>
        <SaveButtonContainer>
        <Button
        title="Save"
        variant="primary"
        accent="blue"
        size="medium"
        />
    </SaveButtonContainer>
    </SettingsPageContainer>
    
</SubMenuTopBarContainer>

)
  
};