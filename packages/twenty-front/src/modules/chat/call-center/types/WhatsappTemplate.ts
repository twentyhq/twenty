interface Component {
  type: string;
  format?: string | null;
  text?: string | null;
}

export interface Template {
  id: string;
  name: string;
  parameter_format: string;
  components: Component[];
  language: string;
  status: string;
  category: string;
}

interface Paging {
  before: string;
  after: string;
}

export interface WhatsappTemplatesResponse {
  templates: Template[];
  paging: Paging;
}
