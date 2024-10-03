import React, { ChangeEvent, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Section } from '@/ui/layout/section/components/Section';
import { H2Title, IconUpload } from 'twenty-ui';
import styled from '@emotion/styled';
import { TextInput } from '@/ui/input/components/TextInput';
import { Button } from '@/ui/input/button/components/Button';
import { isDefined } from '~/utils/isDefined';

const StyledUploadFileContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  width: 100%;
`;

export const SettingsSSOSAMLForm = () => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) {
      console.log('>>>>>>>>>>>>>> handleFileChange: ', e.target.files[0]);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };
  return (
    <>
      <Section>
        <H2Title
          title="Identify Provider Metadata XML"
          description="Upload the XML file with your connection infos"
        />
        <StyledUploadFileContainer>
          <StyledFileInput
            ref={inputFileRef}
            onChange={handleFileChange}
            type="file"
          />
          <Button
            Icon={IconUpload}
            onClick={handleUploadFileClick}
            title="Upload File"
          ></Button>
        </StyledUploadFileContainer>
      </Section>
      <Section>
        <H2Title
          title="Service Provider Details"
          description="Enter the infos to set the connection"
        />
        <StyledInputsContainer>
          <TextInput
            disabled={true}
            autoComplete="off"
            label="ACS Url"
            fullWidth
            placeholder="Client ID"
          />
          <TextInput
            autoComplete="off"
            label="Entity ID"
            fullWidth
            placeholder="Client ID"
          />
        </StyledInputsContainer>
      </Section>
    </>
  );
};
