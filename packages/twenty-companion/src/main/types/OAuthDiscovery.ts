export type OAuthDiscovery = {
  issuer: string;
  authorization_endpoint: string;
  cli_client_id?: string;
  authorization_response_iss_parameter_supported?: boolean;
};
