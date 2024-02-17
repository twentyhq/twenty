import { PropertyBoxContainer } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxContainer';

interface PropertyBoxProps {
  children: React.ReactNode;
  extraPadding?: boolean;
}

export const PropertyBox = ({ children }: PropertyBoxProps) => (
  <PropertyBoxContainer>{children}</PropertyBoxContainer>
);
