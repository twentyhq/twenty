import { CustomHostnameGetResponse } from 'cloudflare/resources/custom-hostnames/custom-hostnames';

export type CustomHostname = Pick<
  CustomHostnameGetResponse,
  | 'hostname'
  | 'id'
  | 'ownership_verification'
  | 'ownership_verification_http'
  | 'status'
>;
