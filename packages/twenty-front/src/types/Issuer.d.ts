// Base Issuer type, similar to IssuerDto from backend
export type Issuer = {
  id: string;
  name: string;
  cnpj: string;
  cpf?: string | null;
  ie?: string | null;
  cnaeCode?: string | null;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  taxRegime: string; // Consider using a string literal union if values are fixed
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  workspaceId: string;
  // workspace: Workspace; // Or WorkspaceDto, depending on what backend returns
};

// For the creation form - matches CreateIssuerInput
export type IssuerFormValues = {
  name: string;
  cnpj: string;
  cpf?: string;
  ie?: string;
  cnaeCode?: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  taxRegime: string;
};

// For the update mutation - matches UpdateIssuerInput
export type UpdateIssuerInput = {
  id: string;
  name?: string;
  cnpj?: string;
  cpf?: string | null;
  ie?: string | null;
  cnaeCode?: string | null;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  taxRegime?: string;
};
