#############
# Providers #
#############
provider "kubernetes" {
  config_path = "~/.kube/config"
}

#################
# Global Locals #
#################
locals {
  twentycrm_app_name            = "twentycrm"
  twentycrm_app_hostname        = "crm.example.com"
  twentycrm_server_image        = "twentycrm/twenty:v0.10.4"
  twentycrm_db_image            = "twentycrm/twenty-postgres:v0.10.4"
  twentycrm_db_pv_path          = "/path/to/mystorage"
  twentycrm_db_pv_capacity      = "10Gi"
  twentycrm_db_pvc_requests     = "10Gi"
  twentycrm_server_pv_path      = "/path/to/mystorage"
  twentycrm_server_pv_capacity  = "10Gi"
  twentycrm_server_pvc_requests = "10Gi"
}

####################
# Terraform Config #
####################
terraform {
  required_version = ">= 1.7.4"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.23.0"
    }
  }

}
