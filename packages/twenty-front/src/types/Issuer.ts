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
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  // workspace?: { id: string }; // If included in GQL
}
