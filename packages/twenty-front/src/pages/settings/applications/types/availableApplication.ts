export type AvailableApplication = {
  id: string;
  name: string;
  description: string;
  author: string;
  logoPath: string;
  category: string;
  aboutDescription: string;
  providers: string[];
  screenshots: string[];
  content: {
    objects: number;
    fields: number;
    functions: number;
    frontComponents: number;
  };
  version: string;
  websiteUrl: string;
  termsUrl: string;
};
