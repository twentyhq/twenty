import { Helmet } from 'react-helmet-async';

type OwnProps = {
  title: string;
};

export function PageTitle({ title }: OwnProps) {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
