import { type ReactNode } from 'react';

type MergeFieldValues = {
  url: string;
  owner: string;
  address: string;
  isIdealCustomer: boolean;
  revenue: string;
  linkedin: string;
  twitter: string;
};

type MergeSourceFixture = {
  id: string;
  name: string;
  subtitle: string;
  avatarIcon?: ReactNode;
  fields: MergeFieldValues;
};

export type AiChatApprovalMergeFixture = {
  id: string;
  title: string;
  sources: readonly [MergeSourceFixture, MergeSourceFixture];
  previews: Record<string, MergeFieldValues>;
};
