export interface Issuer {
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
  taxRegime: string;
  createdAt?: string; // Or Date, adjust as per actual GQL response
  updatedAt?: string; // Or Date
  workspaceId?: string;
  // workspace?: { id: string }; // Example if full workspace object is returned
}

// Form values can be slightly different, e.g., all strings, and then parsed
export type IssuerFormValues = {
  name: string;
  cnpj: string;
  cpf: string; // CPF might be optional in DB, but form can start as string
  ie: string;
  cnaeCode: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  taxRegime: string;
  // workspaceId is usually handled by the hook/mutation logic from context
};

export type UpdateIssuerData = {
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
