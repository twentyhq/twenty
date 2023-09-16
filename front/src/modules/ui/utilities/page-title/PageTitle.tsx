import { Helmet } from 'react-helmet-async';

type OwnProps = {
  title: string;
};

export const PageTitle = ({ title }: OwnProps) => (
  <Helmet>
    <title>{title}</title>
  </Helmet>
);
