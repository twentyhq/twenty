import { hasStayOnDefaultDomainSearchParam } from '@/domain-manager/utils/hasStayOnDefaultDomainSearchParam';

export const isStayOnDefaultDomainRequested = ({
  isStayingOnDefaultDomain,
}: {
  isStayingOnDefaultDomain: boolean;
}) => hasStayOnDefaultDomainSearchParam() || isStayingOnDefaultDomain;
