import { Attachment } from '@/activities/files/types/Attachment';
import { currentUserState } from '@/auth/states/currentUserState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  CreateSignatureFormItems,
  SignatureCreationStep,
} from '@/signature/components/CreateSignatureFormItems';
import { DocumentSignatureEditor } from '@/signature/components/DocumentSignatureEditor';
import {
  getSignatureColor,
  SignatureColor,
} from '@/signature/constants/signatureColors';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import { z } from 'zod';
import { User } from '~/generated/graphql';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const StyledPageContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const StyledAttachmentContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  position: relative;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  min-width: 340px;
  width: 340px;
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  signees: z
    .array(
      z.object({
        id: z.union([z.string(), z.null()]),
        order: z.number().optional(),
        color: z.custom<SignatureColor>(),
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .min(1, 'At least one signee is required'),
  signatures: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        pageIndex: z.number(),
        fieldType: z.number(),
        signee_id: z.string(),
        index: z.number(),
      }),
    )
    .default([]),
  user_signature: z.boolean(),
  order_enabled: z.boolean(),
  additional_receiver_ids: z.array(z.string()).default([]),
  additional_receiver_emails: z.array(z.string().email()).default([]),
  selected_signee_id: z.union([z.string(), z.undefined()]),
  filename: z.string(),
  attachmentId: z.string(),
});

export type CreateSignatureFormValues = z.infer<typeof formSchema>;

export const SignaturePageWithAttachment = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { attachmentId } = useParams();
  const {
    record: attachment,
    loading: attachmentLoading,
    error: attachmentError,
  } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    objectRecordId: attachmentId,
  });
  if (attachmentLoading) {
    return (
      <PageContainer>
        <PageTitle title="Signature Request" />
        <PageHeader title="Signature Request">
          <PageHeaderToggleCommandMenuButton />
        </PageHeader>
        <PageBody>
          <StyledLoaderContainer>
            <Loader />
          </StyledLoaderContainer>
        </PageBody>
      </PageContainer>
    );
  }
  if (!attachment || isDefined(attachmentError) || !currentUser) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noFile" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No Document
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            No document was found for this signature request.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }
  return (
    <SignaturePage
      attachment={attachment as Attachment}
      currentUser={currentUser as User}
    />
  );
};

export const SignaturePage = ({
  attachment,
  currentUser,
}: {
  attachment: ObjectRecord;
  currentUser: User;
}) => {
  const { person } = attachment;
  const [step, setStep] = useState(SignatureCreationStep.CONFIGURATION);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const methods = useForm<CreateSignatureFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      signees: [
        {
          id: currentUser.id,
          order: 1,
          color: getSignatureColor(0),
          name: `(You) ${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email,
        },
        {
          id: person?.id,
          order: 2,
          color: getSignatureColor(1),
          name: `${person?.name.firstName} ${person?.name.lastName}`,
          email: person?.emails?.primaryEmail,
        },
      ],
      signatures: [],
      user_signature: true,
      order_enabled: false,
      additional_receiver_ids: [],
      additional_receiver_emails: [],
      selected_signee_id: person?.id,
      filename: attachment.fullPath,
      attachmentId: attachment.id,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  return (
    <PageContainer>
      <PageTitle title="Signature Request" />
      <PageHeader title="Signature Request">
        <PageHeaderToggleCommandMenuButton />
      </PageHeader>
      <PageBody>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit}>
            <StyledPageContainer>
              <StyledScrollWrapper componentInstanceId="signature-form">
                <CreateSignatureFormItems
                  onNext={setStep}
                  currentStep={step}
                  currentPageIndex={pageNumber - 1}
                  currentUser={currentUser}
                  attachment={attachment}
                />
              </StyledScrollWrapper>
              <StyledAttachmentContainer>
                <DocumentSignatureEditor
                  pageNumber={pageNumber}
                  setPageNumber={setPageNumber}
                  numPages={numPages ?? 0}
                  setNumPages={setNumPages}
                  attachment={attachment}
                />
              </StyledAttachmentContainer>
            </StyledPageContainer>
          </form>
        </FormProvider>
      </PageBody>
    </PageContainer>
  );
};
